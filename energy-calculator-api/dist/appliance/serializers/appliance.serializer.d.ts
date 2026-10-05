import { Appliance } from '../../entities/appliance.entity';
export declare class ApplianceResponse {
    id: number;
    applianceName: string;
    description: string | null;
    publicationStatus: 'draft' | 'published' | 'deleted';
    powerWatts: number | null;
    minTemperature: number | null;
    imageFileName: string | null;
    videoFileName: string | null;
    imageUrl: string;
    videoUrl: string;
    likesCount: number;
    isOwner: 0 | 1;
    isLiked: 0 | 1;
    createdAt: Date | null;
    formattedAt: Date | null;
}
export declare class ApplianceSerializer {
    static toResponse(appliance: Appliance, currentUserId: number): ApplianceResponse;
}
