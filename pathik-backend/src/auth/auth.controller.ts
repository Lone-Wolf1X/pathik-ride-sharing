import { Controller, Post, Body, HttpCode, HttpStatus, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body('phoneNumber') phoneNumber: string) {
    const user = await this.authService.validateUser(phoneNumber);
    return this.authService.login(user);
  }

  @Patch('role/:userId')
  async switchRole(
    @Param('userId') userId: string,
    @Body('role') role: UserRole,
  ) {
    return this.authService.switchRole(userId, role);
  }
}
