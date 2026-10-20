import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import type { CookieOptions } from 'express';
import Redis from 'ioredis';

export const SESSION_COOKIE = 'sessionId';

@Injectable()
export class SessionService implements OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly logger = new Logger(SessionService.name);
  readonly ttlSeconds: number;
  readonly cookieOptions: CookieOptions;

  constructor(config: ConfigService) {
    this.ttlSeconds = Number(config.get('SESSION_TTL_SECONDS', 3600));
    if (!Number.isInteger(this.ttlSeconds) || this.ttlSeconds < 1) {
      throw new Error(
        'SESSION_TTL_SECONDS должен быть положительным целым числом',
      );
    }
    this.cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.get('SESSION_COOKIE_SECURE', 'false') === 'true',
      path: '/',
    };
    this.redis = new Redis({
      host: config.get('REDIS_HOST', '127.0.0.1'),
      port: Number(config.get('REDIS_PORT', 6379)),
      lazyConnect: true,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
    });
    this.redis.on('error', () => this.logger.error('Redis сессий недоступен'));
  }

  async onModuleInit(): Promise<void> {
    await this.redis.connect();
    await this.redis.ping();
  }

  onModuleDestroy(): void {
    this.redis.disconnect();
  }

  async create(userId: number): Promise<string> {
    const token = randomBytes(32).toString('hex');
    try {
      await this.redis.set(
        `session:${token}`,
        String(userId),
        'EX',
        this.ttlSeconds,
      );
      return token;
    } catch {
      throw new ServiceUnavailableException('Хранилище сессий недоступно');
    }
  }

  async getUserId(token: unknown): Promise<number | null> {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return null;
    try {
      const stored = await this.redis.get(`session:${token}`);
      const userId = Number(stored);
      return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
    } catch {
      throw new ServiceUnavailableException('Хранилище сессий недоступно');
    }
  }

  async destroy(token: unknown): Promise<void> {
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return;
    try {
      await this.redis.del(`session:${token}`);
    } catch {
      throw new ServiceUnavailableException('Хранилище сессий недоступно');
    }
  }
}
