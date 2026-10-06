import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserService } from './user.service';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  @HttpCode(201)
  register(@Body() dto: RegisterUserDto) {
    return this.userService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  login() {
    return this.userService.loginStub();
  }

  @Post('logout')
  @HttpCode(200)
  logout() {
    return this.userService.logoutStub();
  }
}
