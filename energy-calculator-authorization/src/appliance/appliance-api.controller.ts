import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiCookieAuth,
  ApiUnauthorizedResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { CurrentUser, Public } from '../auth/auth.decorators';
import {
  ApplianceResponse,
  CreateApplianceResponse,
} from './serializers/appliance.serializer';
import { ApplianceApiService } from './appliance-api.service';
import { ApplianceFilterDto } from './dto/appliance-filter.dto';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { LikeDto } from './dto/like.dto';
import { PublishApplianceDto } from './dto/publish-appliance.dto';

@ApiTags('Приборы')
@ApiBadRequestResponse({
  description: 'Некорректные параметры или тело запроса',
})
@ApiNotFoundResponse({ description: 'Прибор или черновик не найден' })
@Controller('api/appliances')
export class ApplianceApiController {
  constructor(private readonly applianceApiService: ApplianceApiService) {}

  @Get()
  @Public()
  @ApiOkResponse({ type: ApplianceResponse, isArray: true })
  @ApiOperation({ summary: 'Список опубликованных приборов с фильтрацией' })
  getList(
    @Query() filters: ApplianceFilterDto,
    @CurrentUser() userId?: number,
  ) {
    return this.applianceApiService.getList(filters.minPower, userId);
  }

  @Get('feed')
  @Public()
  @ApiOkResponse({ type: ApplianceResponse })
  @ApiOperation({ summary: 'Первая опубликованная карточка ленты' })
  getFeed(@CurrentUser() userId?: number) {
    return this.applianceApiService.getFeed(undefined, false, userId);
  }

  @Get('feed/:id')
  @Public()
  @ApiOkResponse({ type: ApplianceResponse })
  @ApiOperation({ summary: 'Карточка по ID или следующая карточка' })
  @ApiQuery({
    name: 'next',
    required: false,
    type: Boolean,
    description: 'true — перейти к следующей карточке',
  })
  getFeedById(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() userId: number | undefined,
    @Query('next') next?: string,
  ) {
    return this.applianceApiService.getFeed(id, next === 'true', userId);
  }

  @Get('draft')
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({ description: 'Требуется вход' })
  @ApiOkResponse({ type: ApplianceResponse })
  @ApiOperation({ summary: 'Получить черновик текущего пользователя' })
  getDraft(@CurrentUser() userId: number) {
    return this.applianceApiService.getDraft(userId);
  }

  @Post()
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({ description: 'Требуется вход' })
  @ApiCreatedResponse({ type: CreateApplianceResponse })
  @ApiOkResponse({
    type: CreateApplianceResponse,
    description: 'Обновлён существующий черновик',
  })
  @ApiOperation({ summary: 'Далее: создать или обновить черновик с файлами' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['applianceName', 'image', 'video'],
      properties: {
        applianceName: {
          type: 'string',
          maxLength: 256,
          example: 'Новый чайник',
        },
        image: { type: 'string', format: 'binary' },
        video: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'image', maxCount: 1 },
        { name: 'video', maxCount: 1 },
      ],
      {
        storage: memoryStorage(),
        limits: { fileSize: 50 * 1024 * 1024 },
      },
    ),
  )
  async create(
    @CurrentUser() userId: number,
    @Body() dto: CreateApplianceDto,
    @UploadedFiles()
    files: { image?: Express.Multer.File[]; video?: Express.Multer.File[] },
    @Res({ passthrough: true }) response: Response,
  ) {
    const image = files?.image?.[0];
    const video = files?.video?.[0];
    if (!image || !video) {
      throw new BadRequestException('Нужны файлы image и video');
    }

    const result = await this.applianceApiService.createWithFiles(
      dto,
      image,
      video,
      userId,
    );
    response.status(result.created ? 201 : 200);
    return result.appliance;
  }

  @Put('draft')
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({ description: 'Требуется вход' })
  @ApiOkResponse({ type: ApplianceResponse })
  @ApiOperation({ summary: 'Опубликовать черновик' })
  publish(@Body() dto: PublishApplianceDto, @CurrentUser() userId: number) {
    return this.applianceApiService.publish(dto, userId);
  }

  @Delete(':id')
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({ description: 'Требуется вход' })
  @ApiForbiddenResponse({ description: 'Нельзя удалить чужой прибор' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: { message: { type: 'string' }, id: { type: 'integer' } },
    },
  })
  @ApiOperation({ summary: 'Логически удалить свой прибор' })
  @HttpCode(200)
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() userId: number) {
    return this.applianceApiService.softDelete(id, userId);
  }

  @Post(':id/like')
  @ApiCookieAuth()
  @ApiUnauthorizedResponse({ description: 'Требуется вход' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        applianceId: { type: 'integer' },
        value: { type: 'integer', enum: [0, 1] },
        likesCount: { type: 'integer' },
        isLiked: { type: 'integer', enum: [0, 1] },
      },
    },
  })
  @ApiOperation({ summary: 'Поставить или снять лайк' })
  @HttpCode(200)
  like(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LikeDto,
    @CurrentUser() userId: number,
  ) {
    return this.applianceApiService.setLike(id, dto.value, userId);
  }
}
