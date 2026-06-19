import { Controller, Post, Body, Inject, UseGuards, Request } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() body: { email: string; password: string; firstName: string; lastName: string; phoneNumber?: string; countryCode?: string },
  ) {
    return firstValueFrom(
      this.userService.send({ cmd: 'register' }, body),
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user with email' })
  async login(@Body() body: { email: string; password: string }) {
    return firstValueFrom(
      this.userService.send({ cmd: 'login' }, body),
    );
  }

  @Post('login/phone')
  @ApiOperation({ summary: 'Login user with phone number' })
  async loginWithPhone(@Body() body: { phoneNumber: string; password: string }) {
    return firstValueFrom(
      this.userService.send({ cmd: 'login_phone' }, body),
    );
  }

  @Post('login/biometric')
  @ApiOperation({ summary: 'Login with biometric authentication' })
  async loginWithBiometric(@Body() body: { biometricId: string; userId: string; userEmail: string }) {
    return firstValueFrom(
      this.userService.send({ cmd: 'login_biometric' }, body),
    );
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: { refreshToken: string }) {
    return firstValueFrom(
      this.userService.send({ cmd: 'refresh_token' }, body),
    );
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() body: { email: string }) {
    return firstValueFrom(
      this.userService.send({ cmd: 'forgot_password' }, body),
    );
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with code' })
  async resetPassword(@Body() body: { code: string; email: string; newPassword: string }) {
    return firstValueFrom(
      this.userService.send({ cmd: 'reset_password' }, body),
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and revoke refresh token' })
  async logout(@Request() req, @Body() body: { refreshToken: string }) {
    return firstValueFrom(
      this.userService.send({ cmd: 'logout' }, {
        userId: req.user.id,
        refreshToken: body.refreshToken,
      }),
    );
  }

  @Post('logout/all-devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  async logoutAllDevices(@Request() req) {
    return firstValueFrom(
      this.userService.send({ cmd: 'logout_all_devices' }, {
        userId: req.user.id,
      }),
    );
  }
}

