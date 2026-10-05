import { User } from '../../entities/user.entity';
export declare class UserResponse {
    userId: number;
    userName: string;
    email: string;
}
export declare class UserSerializer {
    static toPublic(user: User): UserResponse;
}
