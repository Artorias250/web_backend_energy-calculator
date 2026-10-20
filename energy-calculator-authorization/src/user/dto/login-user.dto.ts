import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsByteLength,
  MaxLength,
} from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'demo@example.com', maxLength: 64 })
  @IsEmail()
  @MaxLength(64)
  email: string;

  @ApiProperty({ example: 'demo', format: 'password', maxLength: 64 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @IsByteLength(1, 72)
  password: string;
}
