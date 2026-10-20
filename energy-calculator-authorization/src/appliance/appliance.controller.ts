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
import { ApiExcludeController } from '@nestjs/swagger';
import { CurrentUser, Public } from '../auth/auth.decorators';

@ApiExcludeController()
@Controller()
export class ApplianceController {
  constructor(private readonly applianceService: ApplianceService) {}

  @Get('appliances-catalog')
  @Public()
  @Render('appliances-catalog')
  async getCatalog(
    @CurrentUser() userId: number | undefined,
    @Query('search') search?: string,
    @Query('minPower') minPower?: string,
  ) {
    const powerNum =
      minPower !== undefined && minPower !== '' ? Number(minPower) : 0;
    const catalogData = await this.applianceService.getCatalog(
      search,
      powerNum,
      userId,
    );

    return {
      title: 'Каталог приборов',
      isCatalog: true,
      appliances: catalogData.appliances,
      search: search || '',
      minPower: powerNum,
    };
  }

  // Метод 2 (GET): Просмотр карточки
  @Get('appliances-feed')
  @Public()
  @Render('appliances-feed')
  async getFirstFeed() {
    const data = await this.applianceService.getFeedAppliance();

    return {
      title: 'Лента приборов',
      isFeed: true,
      ...data,
    };
  }

  @Get('appliances-feed/:id')
  @Public()
  @Render('appliances-feed')
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
  @Get('appliances-draft')
  @Render('appliances-draft')
  async getDraft(@CurrentUser() userId: number) {
    const draft = await this.applianceService.getDraftForUser(userId);

    return {
      title: 'Черновик прибора',
      isDraft: true,
      appliance: draft,
      hasDraft: !!draft,
    };
  }

  // Метод 4 (POST): Нажатие кнопки "Далее" (Создание/Переход)
  @Post('appliances-draft/next')
  @Redirect('/appliances-draft', 302)
  async createDraft(
    @Body('deviceName') deviceName: string,
    @CurrentUser() userId: number,
  ) {
    await this.applianceService.createOrUpdateDraft(deviceName, userId);
  }

  // Метод 5 (POST): Нажатие кнопки "Опубликовать"
  @Post('appliances-draft/publish')
  @Redirect('/appliances-catalog', 302)
  async publishDraft(
    @CurrentUser() userId: number,
    @Body('description') description: string,
    @Body('powerWatts') powerWatts: string,
    @Body('minTemperature') minTemperature: string,
  ) {
    const published = await this.applianceService.publishDraft(
      description,
      parseInt(powerWatts, 10) || 0,
      parseInt(minTemperature, 10) || 10,
      userId,
    );

    return {
      url: `/appliances-feed/${published.applianceId}`,
    };
  }

  // Метод 6 (POST): Логическое удаление с помощью SQL UPDATE (без ORM)
  @Post('appliances/delete')
  @Redirect('/appliances-catalog', 302)
  async deleteAppliance(@Body('id') id: string, @CurrentUser() userId: number) {
    const applianceId = parseInt(id, 10);
    if (!isNaN(applianceId)) {
      await this.applianceService.deleteApplianceRaw(applianceId, userId);
    }
  }
}
