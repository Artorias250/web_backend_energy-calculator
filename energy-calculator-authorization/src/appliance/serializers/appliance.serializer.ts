import { Appliance } from '../../entities/appliance.entity';
import { resolveMediaUrl } from '../../common/media-url';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplianceResponse {
  @ApiProperty({ example: 1 })
  id: number;
  @ApiProperty({ example: 'Новый чайник' })
  applianceName: string;
  @ApiProperty({
    example: 'http://localhost:9000/appliances/image-example.png',
  })
  imageUrl: string;
  @ApiProperty({
    example: 'http://localhost:9000/appliances/video-example.mp4',
  })
  videoUrl: string;
}

export class ApplianceResponse extends CreateApplianceResponse {
  @ApiProperty({ type: String, nullable: true })
  description: string | null;
  @ApiProperty({ enum: ['draft', 'published', 'deleted'] })
  publicationStatus: 'draft' | 'published' | 'deleted';
  @ApiProperty({ type: Number, nullable: true, example: 2200 })
  powerWatts: number | null;
  @ApiProperty({ type: Number, nullable: true, example: 5 })
  minTemperature: number | null;
  @ApiProperty({ type: String, nullable: true })
  imageFileName: string | null;
  @ApiProperty({ type: String, nullable: true })
  videoFileName: string | null;
  @ApiProperty({ example: 0 })
  likesCount: number;
  @ApiProperty({ enum: [0, 1], example: 0 })
  isOwner: 0 | 1;
  @ApiProperty({ enum: [0, 1], example: 0 })
  isLiked: 0 | 1;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  createdAt: Date | null;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  formattedAt: Date | null;
}

export class ApplianceSerializer {
  static toCreateResponse(appliance: Appliance): CreateApplianceResponse {
    return {
      id: appliance.applianceId,
      applianceName: appliance.applianceName,
      imageUrl: resolveMediaUrl(appliance.imageUrl, 'image'),
      videoUrl: resolveMediaUrl(appliance.videoUrl, 'video'),
    };
  }

  static toResponse(
    appliance: Appliance,
    currentUserId?: number,
  ): ApplianceResponse {
    const likes = appliance.likes || [];
    return {
      id: appliance.applianceId,
      applianceName: appliance.applianceName,
      description: appliance.applianceDescription,
      publicationStatus: appliance.publicationStatus,
      powerWatts: appliance.powerWatts,
      minTemperature: appliance.minTemperature,
      imageFileName: appliance.imageUrl,
      videoFileName: appliance.videoUrl,
      imageUrl: resolveMediaUrl(appliance.imageUrl, 'image'),
      videoUrl: resolveMediaUrl(appliance.videoUrl, 'video'),
      likesCount: likes.length,
      isOwner: appliance.creatorId === currentUserId ? 1 : 0,
      isLiked: likes.some((like) => like.userId === currentUserId) ? 1 : 0,
      createdAt: appliance.createdAt,
      formattedAt: appliance.formattedAt,
    };
  }
}
