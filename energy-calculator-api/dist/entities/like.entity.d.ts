import { User } from './user.entity';
import { Appliance } from './appliance.entity';
export declare class Like {
    likeId: number;
    userId: number;
    applianceId: number;
    user: User;
    appliance: Appliance;
}
