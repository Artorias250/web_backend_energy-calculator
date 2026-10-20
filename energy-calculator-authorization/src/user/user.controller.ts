import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../auth/auth.decorators';
import type { AuthRequest } from '../auth/auth.decorators';
import { SESSION_COOKIE, SessionService } from '../auth/session.service';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponse } from './serializers/user.serializer';

@ApiTags('Пользователи')
@Controller('api/users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly sessions: SessionService,
  ) {}

  @Post('register')
  @Public()
  @ApiCreatedResponse({ type: UserResponse })
  @ApiConflictResponse({ description: 'Имя или почта уже заняты' })
  @ApiOperation({ summary: 'Зарегистрировать пользователя' })
  @HttpCode(201)
  register(@Body() dto: RegisterUserDto) {
    return this.userService.register(dto);
  }

  @Post('login')
  @Public()
  @ApiOperation({
    summary: 'Войти: создать сессию Redis и установить cookie sessionId',
  })
  @ApiOkResponse({
    type: UserResponse,
    headers: {
      'Set-Cookie': {
        schema: { type: 'string' },
        description: 'sessionId; HttpOnly; SameSite=Lax; Path=/',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Неверная почта или пароль' })
  @HttpCode(200)
  async login(
    @Body() dto: LoginUserDto,
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.userService.authenticate(dto);
    // Успешный повторный вход заменяет прежнюю сессию этого браузера.
    await this.sessions.destroy(req.cookies?.[SESSION_COOKIE]);
    const token = await this.sessions.create(user.userId);
    res.cookie(SESSION_COOKIE, token, {
      ...this.sessions.cookieOptions,
      maxAge: this.sessions.ttlSeconds * 1000,
    });
    res.setHeader('Cache-Control', 'no-store');
    return user;
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выйти: удалить сессию Redis и очистить cookie' })
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({ description: 'Сессия отсутствует или истекла' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Вы вышли из аккаунта' },
      },
    },
  })
  @HttpCode(200)
  async logout(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.sessions.destroy(req.cookies?.[SESSION_COOKIE]);
    res.clearCookie(SESSION_COOKIE, this.sessions.cookieOptions);
    res.setHeader('Cache-Control', 'no-store');
    return { message: 'Вы вышли из аккаунта' };
  }
}
