const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
process.env.TS_NODE_PROJECT = path.join(__dirname, '../tsconfig.build.json');
require('ts-node/register/transpile-only');
require('dotenv').config({ quiet: true });
const { Client } = require('pg');
const Redis = require('ioredis');
const { DataSource } = require('typeorm');
const { Test } = require('@nestjs/testing');
const {
  ValidationPipe,
  ServiceUnavailableException,
} = require('@nestjs/common');
const { DocumentBuilder, SwaggerModule } = require('@nestjs/swagger');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const { compare } = require('bcryptjs');
const { User } = require('../src/entities/user.entity');
const { Appliance } = require('../src/entities/appliance.entity');
const { Like } = require('../src/entities/like.entity');
const { SessionService } = require('../src/auth/session.service');
const { MinioService } = require('../src/minio/minio.service');

test(
  'ЛР4: сессии Redis, права и бизнес-процесс в изолированной PostgreSQL',
  { timeout: 90000 },
  async (t) => {
    const connection = {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgrespassword',
      database: process.env.DB_DATABASE || 'appliances_db',
      connectionTimeoutMillis: 3000,
    };
    const database = `lab4_test_${process.pid}_${Date.now()}`;
    const admin = new Client(connection);
    const redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT || 6379),
      maxRetriesPerRequest: 1,
    });
    const tokens = [];
    let source,
      app,
      createdDatabase = false;
    const oldDatabase = process.env.DB_DATABASE;
    let cookieA, cookieB, idA, idB, userA, userB;
    const files = (call) =>
      call
        .field('applianceName', 'Тестовый чайник')
        .attach('image', Buffer.from('test image'), {
          filename: 'test.png',
          contentType: 'image/png',
        })
        .attach('video', Buffer.from('test video'), {
          filename: 'test.mp4',
          contentType: 'video/mp4',
        });
    const fields = {
      description: 'Тестовая публикация',
      powerWatts: 2200,
      minTemperature: 0,
    };
    let uploads = 0;
    try {
      await admin.connect();
      await admin.query(`CREATE DATABASE "${database}"`);
      createdDatabase = true;
      source = new DataSource({
        type: 'postgres',
        host: connection.host,
        port: connection.port,
        username: connection.user,
        password: connection.password,
        database,
        entities: [User, Appliance, Like],
        synchronize: true,
      });
      await source.initialize();
      process.env.DB_DATABASE = database;
      const { AppModule } = require('../src/app.module');
      const module = await Test.createTestingModule({ imports: [AppModule] })
        .overrideProvider(MinioService)
        .useValue({
          async upload() {
            uploads++;
          },
          async remove() {},
        })
        .compile();
      app = module.createNestApplication();
      app.use(cookieParser());
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      const doc = SwaggerModule.createDocument(
        app,
        new DocumentBuilder().addCookieAuth('sessionId').build(),
      );
      SwaggerModule.setup('api', app, doc, {
        swaggerOptions: { withCredentials: true },
      });
      await app.init();
      const api = request(app.getHttpServer());
      const login = async (email, password) => {
        const result = await api
          .post('/api/users/login')
          .send({ email, password })
          .expect(200);
        const header = result.headers['set-cookie'][0];
        assert.match(header, /HttpOnly/);
        assert.match(header, /SameSite=Lax/);
        assert.match(header, /Path=\//);
        const cookie = header.split(';')[0];
        tokens.push(cookie.slice('sessionId='.length));
        assert(!('password' in result.body));
        return cookie;
      };

      await t.test(
        'Гость: чтение открыто, изменения и SSR защищены',
        async () => {
          await api.get('/api/appliances?minPower=100').expect(200, []);
          await api
            .get('/api/appliances')
            .set('Cookie', 'sessionId=invalid')
            .expect(200);
          await api
            .get('/api/appliances')
            .set('Cookie', `sessionId=${'f'.repeat(64)}`)
            .expect(200);
          await api.get('/api/appliances/draft').expect(401);
          await api.post('/api/appliances').expect(401);
          await api.put('/api/appliances/draft').send(fields).expect(401);
          await api.delete('/api/appliances/1').expect(401);
          await api
            .post('/api/appliances/1/like')
            .send({ value: 1 })
            .expect(401);
          await api.get('/appliances-draft').expect(401);
          await api
            .post('/appliances-draft/next')
            .type('form')
            .send({ deviceName: 'x' })
            .expect(401);
          await api
            .post('/appliances-draft/publish')
            .type('form')
            .send(fields)
            .expect(401);
          await api
            .post('/appliances/delete')
            .type('form')
            .send({ id: 1 })
            .expect(401);
          assert.equal(uploads, 0);
        },
      );
      await t.test(
        'Регистрация, хеши, неверный пароль и реальные сессии Redis',
        async () => {
          userA = (
            await api
              .post('/api/users/register')
              .send({
                userName: 'alice',
                email: 'alice@example.com',
                password: 'alice-pass',
              })
              .expect(201)
          ).body;
          userB = (
            await api
              .post('/api/users/register')
              .send({
                userName: 'bob',
                email: 'bob@example.com',
                password: 'bob-pass',
              })
              .expect(201)
          ).body;
          assert(!('password' in userA));
          const stored = await source
            .getRepository(User)
            .findOneByOrFail({ userId: userA.userId });
          assert.notEqual(stored.password, 'alice-pass');
          assert(await compare('alice-pass', stored.password));
          await api
            .post('/api/users/register')
            .send({
              userName: 'alice',
              email: 'other@example.com',
              password: 'x',
            })
            .expect(409);
          await api
            .post('/api/users/register')
            .send({
              userName: 'admin',
              email: 'admin@example.com',
              password: 'x',
              role: 'moderator',
            })
            .expect(400);
          await api
            .post('/api/users/login')
            .send({ email: 'alice@example.com', password: 'wrong' })
            .expect(401);
          await api
            .post('/api/users/login')
            .send({ email: 'nobody@example.com', password: 'wrong' })
            .expect(401);
          await api
            .post('/api/users/login')
            .send({ email: 'alice@example.com' })
            .expect(400);
          cookieA = await login('alice@example.com', 'alice-pass');
          cookieB = await login('bob@example.com', 'bob-pass');
          assert.equal(
            await redis.get(`session:${tokens[0]}`),
            String(userA.userId),
          );
          assert((await redis.ttl(`session:${tokens[0]}`)) > 0);
        },
      );
      await t.test(
        'Далее: только три поля, создатель из сессии, отдельный черновик каждого',
        async () => {
          await api
            .get('/api/appliances/draft')
            .set('Cookie', cookieA)
            .expect(404);
          await files(api.post('/api/appliances').set('Cookie', cookieA))
            .field('creatorId', userB.userId)
            .expect(400);
          await files(api.post('/api/appliances').set('Cookie', cookieA))
            .field('publicationStatus', 'published')
            .expect(400);
          await api
            .post('/api/appliances')
            .set('Cookie', cookieA)
            .field('applianceName', 'Missing files')
            .expect(400);
          const created = (
            await files(
              api.post('/api/appliances').set('Cookie', cookieA),
            ).expect(201)
          ).body;
          assert.deepEqual(
            Object.keys(created).sort(),
            ['id', 'applianceName', 'imageUrl', 'videoUrl'].sort(),
          );
          idA = created.id;
          assert.equal(
            (
              await files(
                api.post('/api/appliances').set('Cookie', cookieA),
              ).expect(200)
            ).body.id,
            idA,
          );
          idB = (
            await files(
              api.post('/api/appliances').set('Cookie', cookieB),
            ).expect(201)
          ).body.id;
          assert.notEqual(idA, idB);
          const draft = (
            await api
              .get('/api/appliances/draft')
              .set('Cookie', cookieA)
              .expect(200)
          ).body;
          assert.equal(draft.id, idA);
          assert.equal(draft.description, null);
          assert.equal(draft.isOwner, 1);
          assert.equal(
            (
              await source
                .getRepository(Appliance)
                .findOneByOrFail({ applianceId: idA })
            ).creatorId,
            userA.userId,
          );
          await api.get('/api/appliances').expect(200, []);
          await api.get(`/api/appliances/feed/${idA}`).expect(404);
        },
      );
      await t.test(
        'Публикация только своего черновика, фильтр и персональные признаки',
        async () => {
          await api
            .put('/api/appliances/draft')
            .set('Cookie', cookieA)
            .send({ description: 'Missing numbers' })
            .expect(400);
          await api
            .put('/api/appliances/draft')
            .set('Cookie', cookieA)
            .send({ ...fields, creatorId: userB.userId })
            .expect(400);
          const published = (
            await api
              .put('/api/appliances/draft')
              .set('Cookie', cookieA)
              .send(fields)
              .expect(200)
          ).body;
          assert.equal(published.id, idA);
          assert.equal(published.publicationStatus, 'published');
          assert.equal(published.minTemperature, 0);
          assert(published.formattedAt);
          assert.equal(
            (
              await api
                .get('/api/appliances/draft')
                .set('Cookie', cookieB)
                .expect(200)
            ).body.id,
            idB,
          );
          await api
            .put('/api/appliances/draft')
            .set('Cookie', cookieA)
            .send(fields)
            .expect(404);
          await api
            .put('/api/appliances/draft')
            .set('Cookie', cookieB)
            .send({ ...fields, powerWatts: 100 })
            .expect(200);
          const guest = (
            await api.get('/api/appliances?minPower=1000').expect(200)
          ).body;
          assert.equal(guest.length, 1);
          assert.equal(guest[0].id, idA);
          assert.equal(guest[0].isOwner, 0);
          assert.equal(guest[0].isLiked, 0);
          const own = (
            await api.get('/api/appliances').set('Cookie', cookieA).expect(200)
          ).body;
          assert.equal(own.find((r) => r.id === idA).isOwner, 1);
          assert.equal(own.find((r) => r.id === idB).isOwner, 0);
          assert.equal(
            (await api.get('/api/appliances/feed').expect(200)).body.id,
            idA,
          );
          assert.equal(
            (await api.get(`/api/appliances/feed/${idA}?next=true`).expect(200))
              .body.id,
            idB,
          );
          assert.equal(
            (await api.get(`/api/appliances/feed/${idB}?next=true`).expect(200))
              .body.id,
            idA,
          );
        },
      );
      await t.test(
        'Лайки привязаны к пользователю и не дублируются',
        async () => {
          await api
            .post(`/api/appliances/${idA}/like`)
            .set('Cookie', cookieB)
            .send({ value: 1 })
            .expect(200);
          assert.equal(
            (
              await api
                .post(`/api/appliances/${idA}/like`)
                .set('Cookie', cookieB)
                .send({ value: 1 })
                .expect(200)
            ).body.likesCount,
            1,
          );
          assert.equal(
            (
              await api
                .get(`/api/appliances/feed/${idA}`)
                .set('Cookie', cookieB)
                .expect(200)
            ).body.isLiked,
            1,
          );
          assert.equal(
            (
              await api
                .get(`/api/appliances/feed/${idA}`)
                .set('Cookie', cookieA)
                .expect(200)
            ).body.isLiked,
            0,
          );
          assert.equal(
            (
              await api
                .post(`/api/appliances/${idA}/like`)
                .set('Cookie', cookieB)
                .send({ value: 0 })
                .expect(200)
            ).body.likesCount,
            0,
          );
          await api
            .post(`/api/appliances/${idA}/like`)
            .set('Cookie', cookieB)
            .send({ value: 2 })
            .expect(400);
        },
      );
      await t.test(
        'Чужое удаление запрещено в API и SSR, soft delete скрывает карточку',
        async () => {
          await api
            .delete(`/api/appliances/${idA}`)
            .set('Cookie', cookieB)
            .expect(403);
          await api
            .post('/appliances/delete')
            .set('Cookie', cookieB)
            .type('form')
            .send({ id: idA })
            .expect(403);
          await api
            .delete(`/api/appliances/${idA}`)
            .set('Cookie', cookieA)
            .expect(200);
          const row = await source
            .getRepository(Appliance)
            .findOneByOrFail({ applianceId: idA });
          assert.equal(row.publicationStatus, 'deleted');
          assert(row.completedAt);
          await api.get(`/api/appliances/feed/${idA}`).expect(404);
          await api
            .post(`/api/appliances/${idA}/like`)
            .set('Cookie', cookieB)
            .send({ value: 1 })
            .expect(404);
          assert(
            !(await api.get('/api/appliances').expect(200)).body.some(
              (r) => r.id === idA,
            ),
          );
        },
      );
      await t.test(
        'Повторный вход заменяет сессию, выход и TTL отзывают доступ',
        async () => {
          const oldA = cookieA;
          cookieA = await login('alice@example.com', 'alice-pass');
          // Для замены сессии браузер должен отправить предыдущую cookie.
          const relogin = await api
            .post('/api/users/login')
            .set('Cookie', cookieA)
            .send({ email: 'alice@example.com', password: 'alice-pass' })
            .expect(200);
          await api
            .get('/api/appliances/draft')
            .set('Cookie', cookieA)
            .expect(401);
          const newCookie = relogin.headers['set-cookie'][0].split(';')[0];
          tokens.push(newCookie.slice('sessionId='.length));
          const out = await api
            .post('/api/users/logout')
            .set('Cookie', newCookie)
            .expect(200);
          assert.match(
            out.headers['set-cookie'][0],
            /Expires=Thu, 01 Jan 1970/,
          );
          assert.equal(await redis.get(`session:${tokens.at(-1)}`), null);
          await api
            .get('/api/appliances/draft')
            .set('Cookie', newCookie)
            .expect(401);
          await redis.pexpire(
            `session:${cookieB.slice('sessionId='.length)}`,
            1,
          );
          await new Promise((resolve) => setTimeout(resolve, 20));
          await api
            .get('/api/appliances/draft')
            .set('Cookie', cookieB)
            .expect(401);
          await api.get('/api/appliances').set('Cookie', cookieB).expect(200);
          await api
            .get('/api/appliances/draft')
            .set('Cookie', oldA)
            .expect(404); // другой действующий вход не отзывается
        },
      );
      await t.test(
        'При сбое Redis публичный список работает, изменение возвращает 503',
        async () => {
          const sessions = app.get(SessionService);
          const original = sessions.getUserId;
          sessions.getUserId = async () => {
            throw new ServiceUnavailableException();
          };
          try {
            await api.get('/api/appliances').set('Cookie', cookieB).expect(200);
            await api
              .put('/api/appliances/draft')
              .set('Cookie', cookieB)
              .send(fields)
              .expect(503);
          } finally {
            sessions.getUserId = original;
          }
        },
      );
      await t.test(
        'Swagger: публичные GET и cookie на защищённых методах',
        async () => {
          await api.get('/api').expect(200);
          const doc = (await api.get('/api-json').expect(200)).body;
          assert(!doc.paths['/api/appliances'].get.security);
          assert.deepEqual(doc.paths['/api/appliances/draft'].put.security, [
            { cookie: [] },
          ]);
          assert.deepEqual(doc.paths['/api/users/logout'].post.security, [
            { cookie: [] },
          ]);
          assert(doc.components.schemas.LoginUserDto.properties.password);
          assert(
            Object.keys(doc.paths).every((url) => url.startsWith('/api/')),
          );
          assert.deepEqual(
            doc.paths['/api/appliances'].post.requestBody.content[
              'multipart/form-data'
            ].schema.required,
            ['applianceName', 'image', 'video'],
          );
        },
      );
    } finally {
      for (const token of tokens) await redis.del(`session:${token}`);
      redis.disconnect();
      if (app) await app.close();
      if (source?.isInitialized) await source.destroy();
      if (createdDatabase) await admin.query(`DROP DATABASE "${database}"`);
      await admin.end();
      if (oldDatabase === undefined) delete process.env.DB_DATABASE;
      else process.env.DB_DATABASE = oldDatabase;
    }
  },
);
