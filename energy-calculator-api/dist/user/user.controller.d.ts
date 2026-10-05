import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    register(dto: RegisterUserDto): Promise<import("./serializers/user.serializer").UserResponse>;
    login(): {
        message: string;
    };
    logout(): {
        message: string;
    };
}
