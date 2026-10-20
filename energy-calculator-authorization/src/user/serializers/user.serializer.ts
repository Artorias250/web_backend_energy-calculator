import { User } from '../../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty({ example: 1 })
  userId: number;
  @ApiProperty({ example: 'demo' })
  userName: string;
  @ApiProperty({ example: 'demo@example.com' })
  email: string;
}

export class UserSerializer {
  static toPublic(user: User): UserResponse {
    return {
      userId: user.userId,
      userName: user.userName,
      email: user.email,
    };
  }
}
