import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplianceController } from './appliance.controller';
import { ApplianceService } from './appliance.service';
import { Appliance } from '../entities/appliance.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appliance, Like, User])],
  controllers: [ApplianceController],
  providers: [ApplianceService],
  exports: [ApplianceService],
})
export class ApplianceModule {}
