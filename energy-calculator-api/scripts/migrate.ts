import { DataSource } from 'typeorm';
import { User } from '../src/entities/user.entity';
import { Appliance } from '../src/entities/appliance.entity';
import { Like } from '../src/entities/like.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgrespassword',
  database: process.env.DB_DATABASE || 'appliances_db',
  entities: [User, Appliance, Like],
  synchronize: false, // не синкать при initialize — сначала DROP
});

// Скрипт удаляет все таблицы. На заполненной базе его не запускать.
// Колонки лабораторной 3 добавляет scripts/lab3-alter.sql.
async function run() {
  await dataSource.initialize();

  // Старые столбцы/ключи несовместимы с новой ER — пересоздаём таблицы
  await dataSource.query('DROP TABLE IF EXISTS likes CASCADE');
  await dataSource.query('DROP TABLE IF EXISTS appliances CASCADE');
  await dataSource.query('DROP TABLE IF EXISTS users CASCADE');

  await dataSource.synchronize(true);

  await dataSource.getRepository(User).save({
    userName: 'demo',
    email: 'demo@example.com',
    password: 'demo',
  });

  console.log(
    'Таблицы пересозданы по ER-диаграмме, пользователь demo (user_id=1) добавлен.',
  );
  await dataSource.destroy();
  process.exit(0);
}

run().catch((err) => {
  console.error('Ошибка создания таблиц:', err);
  process.exit(1);
});
