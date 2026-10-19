import { Appliance } from '../../entities/appliance.entity';
export declare class CreateApplianceResponse {
    id: number;
    applianceName: string;
    imageUrl: string;
    videoUrl: string;
}
export declare class ApplianceResponse extends CreateApplianceResponse {
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
export declare class ApplianceSerializer {
    static toCreateResponse(appliance: Appliance): CreateApplianceResponse;
    static toResponse(appliance: Appliance, currentUserId: number): ApplianceResponse;
}
