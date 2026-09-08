import {
  Controller,
  Get,
  Param,
  Query,
  Render,
  ParseIntPipe,
} from '@nestjs/common';
import { ApplianceService } from './appliance.service';

@Controller()
export class ApplianceController {
  constructor(private readonly applianceService: ApplianceService) {}

  @Get('feed/:id')
  @Render('feed')
  getFeed(@Param('id', ParseIntPipe) id: number, @Query('next') next?: string) {
    const isNext = next === 'true';
    const data = this.applianceService.getFeedAppliance(id, isNext);

    return {
      title: 'Лента приборов',
      isFeed: true,
      ...data,
    };
  }

  @Get('draft')
  @Render('draft')
  getDraft() {
    const draft = this.applianceService.getDraft();

    return {
      title: 'Черновик',
      isDraft: true,
      appliance: draft,
      imageUrl: draft?.imageUrl,
      videoUrl: draft?.videoUrl,
      likesCount: draft?.likesCount || 0,
    };
  }

  @Get('catalog')
  @Render('catalog')
  getCatalog(@Query('power_min') powerMin?: string) {
    const minVal = powerMin ? parseInt(powerMin, 10) : undefined;
    const data = this.applianceService.getCatalog(minVal);

    return {
      title: 'Плитка приборов',
      isCatalog: true,
      powerMin: powerMin || '',
      ...data,
    };
  }
}
