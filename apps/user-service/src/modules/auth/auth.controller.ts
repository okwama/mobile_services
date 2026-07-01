import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { USER_SERVICE_PATTERNS } from '@app/common';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  async register(@Payload() data: { email: string; password: string; firstName: string; lastName: string; phoneNumber?: string; countryCode?: string }) {
    return this.authService.register(data);
  }

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() data: { email: string; password: string }) {
    return this.authService.login(data.email, data.password);
  }

  @MessagePattern({ cmd: 'login_phone' })
  async loginWithPhone(@Payload() data: { phoneNumber: string; password: string }) {
    return this.authService.loginWithPhone(data.phoneNumber, data.password);
  }

  @MessagePattern({ cmd: 'login_biometric' })
  async loginWithBiometric(@Payload() data: { biometricId: string; userId: string; userEmail: string }) {
    return this.authService.loginWithBiometric(data.biometricId, data.userId, data.userEmail);
  }

  @MessagePattern({ cmd: 'change_password' })
  async changePassword(@Payload() data: { userId: string; currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(data.userId, data.currentPassword, data.newPassword);
  }

  @MessagePattern({ cmd: 'refresh_token' })
  async refreshToken(@Payload() data: { refreshToken: string }) {
    return this.authService.refreshToken(data.refreshToken);
  }

  @MessagePattern({ cmd: 'forgot_password' })
  async forgotPassword(@Payload() data: { email: string }) {
    return this.authService.forgotPassword(data.email);
  }

  @MessagePattern({ cmd: 'reset_password' })
  async resetPassword(@Payload() data: { code: string; email: string; newPassword: string }) {
    return this.authService.resetPassword(data.code, data.email, data.newPassword);
  }

  @MessagePattern({ cmd: 'validate_token' })
  async validateToken(@Payload() data: { token: string }) {
    return this.authService.validateToken(data.token);
  }

  @MessagePattern(USER_SERVICE_PATTERNS.VALIDATE_USER)
  async validateUser(@Payload() data: { userId: string }) {
    return this.authService.validateUserById(data.userId);
  }

  @MessagePattern({ cmd: 'logout' })
  async logout(@Payload() data: { userId: string; refreshToken: string }) {
    return this.authService.logout(data.userId, data.refreshToken);
  }

  @MessagePattern({ cmd: 'logout_all_devices' })
  async logoutAllDevices(@Payload() data: { userId: string }) {
    return this.authService.logoutAllDevices(data.userId);
  }
}

