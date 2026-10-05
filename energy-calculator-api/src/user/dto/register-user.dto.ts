import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  userName: string;

  @IsEmail()
  @MaxLength(64)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  password: string;
}
