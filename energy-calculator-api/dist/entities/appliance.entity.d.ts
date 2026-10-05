import { User } from './user.entity';
import { Like } from './like.entity';
export declare class Appliance {
    applianceId: number;
    applianceName: string;
    applianceDescription: string | null;
    publicationStatus: 'draft' | 'published' | 'deleted';
    imageUrl: string | null;
    videoUrl: string | null;
    powerWatts: number | null;
    minTemperature: number | null;
    createdAt: Date | null;
    formattedAt: Date | null;
    completedAt: Date | null;
    creatorId: number;
    moderatorId: number | null;
    creator: User;
    moderator: User | null;
    likes: Like[];
}
