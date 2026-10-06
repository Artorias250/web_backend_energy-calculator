import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioModule } from '../minio/minio.module';
import { Appliance } from '../entities/appliance.entity';
import { Like } from '../entities/like.entity';
import { User } from '../entities/user.entity';
import { ApplianceApiController } from './appliance-api.controller';
import { ApplianceApiService } from './appliance-api.service';
import { ApplianceController } from './appliance.controller';
import { ApplianceRepository } from './appliance.repository';
import { ApplianceService } from './appliance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appliance, Like, User]),
    MinioModule,
  ],
  controllers: [ApplianceController, ApplianceApiController],
  providers: [ApplianceService, ApplianceApiService, ApplianceRepository],
  exports: [ApplianceService],
})
export class ApplianceModule {}
