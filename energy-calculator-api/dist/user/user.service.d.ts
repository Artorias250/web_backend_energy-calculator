import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponse } from './serializers/user.serializer';
export declare class UserService {
    private readonly users;
    constructor(users: Repository<User>);
    register(dto: RegisterUserDto): Promise<UserResponse>;
    loginStub(): {
        message: string;
    };
    logoutStub(): {
        message: string;
    };
}
