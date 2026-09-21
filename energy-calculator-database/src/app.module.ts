import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplianceModule } from './appliance/appliance.module';

@Module({
  imports: [
    // Подключение конфигурации .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Динамическое подключение к PostgreSQL через TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgrespassword'),
        database: config.get<string>('DB_DATABASE', 'appliances_db'),
        autoLoadEntities: true, // Автоматически загружает все entities из модулей
        synchronize: false, // Отключено, так как используем скрипт миграции
      }),
    }),

    ApplianceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
