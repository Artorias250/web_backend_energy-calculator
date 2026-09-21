import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Render,
  Redirect,
  ParseIntPipe,
} from '@nestjs/common';
import { ApplianceService } from './appliance.service';

@Controller()
export class ApplianceController {
  constructor(private readonly applianceService: ApplianceService) {}

  // Метод 1 (GET): Главная страница каталога с поиском
  @Get('catalog')
  @Render('catalog')
  async getCatalog(
    @Query('search') search?: string,
    @Query('minPower') minPower?: string,
  ) {
    const powerNum =
      minPower !== undefined && minPower !== '' ? Number(minPower) : 0;
    const catalogData = await this.applianceService.getCatalog(
      search,
      powerNum,
    );

    return {
      title: 'Каталог приборов',
      appliances: catalogData.appliances,
      search: search || '',
      minPower: powerNum,
    };
  }

  // Метод 2 (GET): Просмотр карточки
  @Get('feed/:id')
  @Render('feed')
  async getFeed(
    @Param('id', ParseIntPipe) id: number,
    @Query('next') next?: string,
  ) {
    const isNext = next === 'true';
    const data = await this.applianceService.getFeedAppliance(id, isNext);

    return {
      title: 'Лента приборов',
      isFeed: true,
      ...data,
    };
  }

  // Метод 3 (GET): Открытие черновика
  @Get('draft')
  @Render('draft')
  async getDraft() {
    const draft = await this.applianceService.getDraftForUser(1);

    console.log('--- DRAFT DATA SENT TO TEMPLATE ---', draft);

    return {
      title: 'Черновик прибора',
      isDraft: true,
      appliance: draft,
      hasDraft: !!draft,
    };
  }

  // Метод 4 (POST): Нажатие кнопки "Далее" (Создание/Переход)
  @Post('draft/next')
  @Redirect('/draft', 302)
  async createDraft(@Body('deviceName') deviceName: string) {
    await this.applianceService.createOrUpdateDraft(deviceName, 1);
  }

  // Метод 5 (POST): Нажатие кнопки "Опубликовать"
  // Метод 5 (POST): Нажатие кнопки "Опубликовать"
  @Post('draft/publish')
  @Redirect('/catalog', 302)
  async publishDraft(
    @Body('description') description: string,
    @Body('powerWatts') powerWatts: string,
    @Body('minTemperature') minTemperature: string,
  ) {
    const published = await this.applianceService.publishDraft(
      description,
      parseInt(powerWatts, 10) || 0,
      parseInt(minTemperature, 10) || 10,
      1,
    );

    return {
      url: `/feed/${published.id}`, // Используем ключ url для NestJS @Redirect
    };
  }

  // Метод 6 (POST): Логическое удаление с помощью SQL UPDATE (без ORM)
  @Post('appliances/delete')
  @Redirect('/catalog', 302)
  async deleteAppliance(@Body('id') id: string) {
    const applianceId = parseInt(id, 10);
    if (!isNaN(applianceId)) {
      await this.applianceService.deleteApplianceRaw(applianceId);
    }
  }
}
