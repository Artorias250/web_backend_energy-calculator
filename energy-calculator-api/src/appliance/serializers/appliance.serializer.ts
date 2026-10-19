import { Appliance } from '../../entities/appliance.entity';
import { resolveMediaUrl } from '../../common/media-url';

export class CreateApplianceResponse {
  id: number;
  applianceName: string;
  imageUrl: string;
  videoUrl: string;
}

export class ApplianceResponse extends CreateApplianceResponse {
  description: string | null;
  publicationStatus: 'draft' | 'published' | 'deleted';
  powerWatts: number | null;
  minTemperature: number | null;
  imageFileName: string | null;
  videoFileName: string | null;
  likesCount: number;
  isOwner: 0 | 1;
  isLiked: 0 | 1;
  createdAt: Date | null;
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
    currentUserId: number,
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
