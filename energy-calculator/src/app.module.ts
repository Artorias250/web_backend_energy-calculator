import { Module } from '@nestjs/common';
import { ApplianceModule } from './appliance/appliance.module';

@Module({
  imports: [ApplianceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
