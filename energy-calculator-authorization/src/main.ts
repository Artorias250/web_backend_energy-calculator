import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser = require('cookie-parser');
import { join } from 'path';
import { readFileSync, readdirSync } from 'fs';
import { ConfigService } from '@nestjs/config';
import hbs = require('hbs');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get(ConfigService);
  app.enableCors({
    origin: config
      .get<string>('FRONTEND_ORIGIN', 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim()),
    credentials: true,
  });
  app.enableShutdownHooks();
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  app.set('view cache', false);

  // Явная регистрация partials с диска при каждом старте
  const partialsDir = join(__dirname, '..', 'views', 'partials');
  for (const file of readdirSync(partialsDir)) {
    if (!file.endsWith('.hbs')) continue;
    const name = file.replace(/\.hbs$/, '');
    hbs.registerPartial(name, readFileSync(join(partialsDir, file), 'utf8'));
  }

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Приборы — API')
    .setDescription(
      'Каталог и лента доступны гостям. Для черновика и изменений выполните POST /api/users/login: браузер сохранит HttpOnly cookie sessionId и будет отправлять её автоматически. Сессии хранятся в Redis. Для Postman скопируйте sessionId из Application → Cookies в заголовок Cookie: sessionId=<значение>. Регистрация не выполняет автоматический вход.',
    )
    .setVersion('1.0')
    .addCookieAuth('sessionId')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: { withCredentials: true },
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
