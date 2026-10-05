import { User } from '../../entities/user.entity';

export class UserResponse {
  userId: number;
  userName: string;
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
