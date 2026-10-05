import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponse, UserSerializer } from './serializers/user.serializer';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async register(dto: RegisterUserDto): Promise<UserResponse> {
    const user = this.users.create({
      userName: dto.userName,
      email: dto.email,
      password: dto.password,
    });

    try {
      const saved = await this.users.save(user);
      return UserSerializer.toPublic(saved);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException(
          'Пользователь с таким именем или почтой уже существует',
        );
      }
      throw error;
    }
  }

  loginStub() {
    return {
      message: 'Аутентификация будет реализована в лабораторной работе 4',
    };
  }

  logoutStub() {
    return {
      message: 'Деавторизация будет реализована в лабораторной работе 4',
    };
  }
}
