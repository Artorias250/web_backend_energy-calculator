import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { SessionGuard } from './session.guard';
import { SessionService } from './session.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [SessionService, { provide: APP_GUARD, useClass: SessionGuard }],
  exports: [SessionService],
})
export class AuthModule {}
