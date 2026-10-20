import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponse, UserSerializer } from './serializers/user.serializer';
import { compare, hash } from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';

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
      password: await hash(dto.password, 12),
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

  async authenticate(dto: LoginUserDto): Promise<UserResponse> {
    const user = await this.users.findOneBy({ email: dto.email });
    // Валидный хеш для сравнения при неизвестном email, чтобы не пропускать bcrypt.
    const dummyHash =
      '$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    const valid = await compare(dto.password, user?.password ?? dummyHash);
    if (!user || !valid) {
      throw new UnauthorizedException('Неверная почта или пароль');
    }
    return UserSerializer.toPublic(user);
  }
}
