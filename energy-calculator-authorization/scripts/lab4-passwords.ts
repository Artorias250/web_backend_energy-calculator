import 'dotenv/config';
import { DataSource } from 'typeorm';
import { hash } from 'bcryptjs';
import { User } from '../src/entities/user.entity';
import { Appliance } from '../src/entities/appliance.entity';
import { Like } from '../src/entities/like.entity';

// Неразрушающий, повторно запускаемый переход от паролей ЛР3 к bcrypt.
// Хеш bcrypt занимает 60 символов и помещается в существующий varchar(64).
async function run() {
  const source = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgrespassword',
    database: process.env.DB_DATABASE || 'appliances_db',
    entities: [User, Appliance, Like],
    synchronize: false,
  });
  await source.initialize();
  try {
    const count = await source.transaction(async (manager) => {
      const users = manager.getRepository(User);
      const rows = await users
        .createQueryBuilder('user')
        .setLock('pessimistic_write')
        .getMany();
      let updated = 0;
      for (const user of rows) {
        if (/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(user.password))
          continue;
        if (Buffer.byteLength(user.password, 'utf8') > 72) {
          throw new Error(
            `Пароль пользователя ${user.userId} превышает 72 байта; транзакция отменена`,
          );
        }
        user.password = await hash(user.password, 12);
        await users.save(user);
        updated++;
      }
      return updated;
    });
    console.log(
      `Пароли преобразованы: ${count}. Пользователи, приборы и лайки сохранены.`,
    );
  } finally {
    await source.destroy();
  }
}

run().catch((error) => {
  console.error(
    error instanceof Error ? error.message : 'Не удалось преобразовать пароли',
  );
  process.exitCode = 1;
});
