import { Module } from '@nestjs/common';
import { ApplianceController } from './appliance.controller';
import { ApplianceService } from './appliance.service';

@Module({
  controllers: [ApplianceController],
  providers: [ApplianceService],
})
export class ApplianceModule {}
