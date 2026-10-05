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
import { ApplianceApiService } from './appliance-api.service';
import { ApplianceFilterDto } from './dto/appliance-filter.dto';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { LikeDto } from './dto/like.dto';
import { PublishApplianceDto } from './dto/publish-appliance.dto';

@Controller('api/appliances')
export class ApplianceApiController {
  constructor(private readonly applianceApiService: ApplianceApiService) {}

  @Get()
  getList(@Query() filters: ApplianceFilterDto) {
    return this.applianceApiService.getList(filters.minPower);
  }

  @Get('feed')
  getFeed() {
    return this.applianceApiService.getFeed();
  }

  @Get('feed/:id')
  getFeedById(
    @Param('id', ParseIntPipe) id: number,
    @Query('next') next?: string,
  ) {
    return this.applianceApiService.getFeed(id, next === 'true');
  }

  @Get('draft')
  getDraft() {
    return this.applianceApiService.getDraft();
  }

  @Post()
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
    );
    response.status(result.created ? 201 : 200);
    return result.appliance;
  }

  @Put('draft')
  publish(@Body() dto: PublishApplianceDto) {
    return this.applianceApiService.publish(dto);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.applianceApiService.softDelete(id);
  }

  @Post(':id/like')
  @HttpCode(200)
  like(@Param('id', ParseIntPipe) id: number, @Body() dto: LikeDto) {
    return this.applianceApiService.setLike(id, dto.value);
  }
}
