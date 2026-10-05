import { Appliance } from './appliance.entity';
import { Like } from './like.entity';
export declare class User {
    userId: number;
    userName: string;
    email: string;
    password: string;
    appliances: Appliance[];
    likes: Like[];
}
