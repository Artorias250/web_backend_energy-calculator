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
  synchronize: true, // Создаст таблицы автоматически на основе entities
});

async function run() {
  await dataSource.initialize();
  await dataSource.synchronize();
  console.log('Таблицы в БД успешно созданы!');
  await dataSource.destroy();
  process.exit(0);
}

run().catch((err) => {
  console.error('Ошибка создания таблиц:', err);
  process.exit(1);
});
