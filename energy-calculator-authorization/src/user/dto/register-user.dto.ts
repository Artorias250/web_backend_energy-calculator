import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsByteLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'student', maxLength: 128 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  userName: string;

  @ApiProperty({ example: 'student@example.com', maxLength: 64 })
  @IsEmail()
  @MaxLength(64)
  email: string;

  @ApiProperty({
    example: 'example-password',
    maxLength: 64,
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  @IsByteLength(1, 72)
  password: string;
}
