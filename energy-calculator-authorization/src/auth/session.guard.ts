import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { AuthRequest, PUBLIC_ROUTE } from './auth.decorators';
import { SESSION_COOKIE, SessionService } from './session.service';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<AuthRequest>();
    try {
      const userId = await this.sessions.getUserId(
        request.cookies?.[SESSION_COOKIE],
      );
      if (userId && (await this.users.existsBy({ userId })))
        request.currentUserId = userId;
    } catch (error) {
      // Публичные GET работают и при недоступном Redis, как для гостя.
      if (!isPublic || !(error instanceof ServiceUnavailableException))
        throw error;
    }
    if (!isPublic && !request.currentUserId) {
      throw new UnauthorizedException('Требуется вход в аккаунт');
    }
    return true;
  }
}
