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
  getCatalog(@Query('minPower') minPower?: string) {
    // Преобразуем входящий параметр в число
    const powerNum =
      minPower !== undefined && minPower !== '' ? Number(minPower) : 0;

    // Вызываем готовый метод сервиса getCatalog, передавая powerNum
    const catalogData = this.applianceService.getCatalog(powerNum);

    return {
      title: 'Каталог приборов',
      appliances: catalogData.appliances,
      minPower: powerNum,
    };
  }
}
