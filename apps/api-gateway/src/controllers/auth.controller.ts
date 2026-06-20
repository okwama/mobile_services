import { Controller, Post, Body, Inject, UseGuards, Request, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RegisterDto, LoginDto, LoginPhoneDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from '../dtos/auth.dto';
import { getErrorMessage, errorIncludesKeyword } from '../utils/error.utils';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 500, description: 'Server error' })
  async register(@Body() body: RegisterDto) {
    try {
      const result = await firstValueFrom(
        this.userService.send({ cmd: 'register' }, body).pipe(
          timeout(10000)
        ),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new HttpException(
          'User service timeout - registration took too long',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }
      if (errorIncludesKeyword(error, 'already exists')) {
        throw new HttpException(getErrorMessage(error), HttpStatus.CONFLICT);
      }
      throw new HttpException(
        getErrorMessage(error) || 'Registration failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user with email or phone number' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Invalid email/phone or password' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: LoginDto) {
    try {
      // Validate that either email or phone is provided
      if (!body.email && !body.phoneNumber) {
        throw new BadRequestException('Either email or phoneNumber is required');
      }

      if (body.email) {
        const result = await firstValueFrom(
          this.userService.send({ cmd: 'login' }, { email: body.email, password: body.password }).pipe(
            timeout(10000)
          ),
        );
        return result;
      } else if (body.phoneNumber) {
        const result = await firstValueFrom(
          this.userService.send({ cmd: 'login_phone' }, { phoneNumber: body.phoneNumber, password: body.password }).pipe(
            timeout(10000)
          ),
        );
        return result;
      }
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new HttpException(
          'User service timeout - login took too long',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (errorIncludesKeyword(error, 'not found') || errorIncludesKeyword(error, 'invalid')) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException(
        getErrorMessage(error) || 'Login failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login/phone')
  @ApiOperation({ summary: 'Login user with phone number (Backward compatible)' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginWithPhone(@Body() body: LoginPhoneDto) {
    try {
      const result = await firstValueFrom(
        this.userService.send({ cmd: 'login_phone' }, body).pipe(
          timeout(10000)
        ),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new HttpException(
          'User service timeout - login took too long',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }
      if (errorIncludesKeyword(error, 'not found') || errorIncludesKeyword(error, 'invalid')) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException(
        getErrorMessage(error) || 'Login failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login/biometric')
  @ApiOperation({ summary: 'Login with biometric authentication' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async loginWithBiometric(@Body() body: { biometricId: string; userId: string; userEmail: string }) {
    try {
      const result = await firstValueFrom(
        this.userService.send({ cmd: 'login_biometric' }, body).pipe(
          timeout(10000)
        ),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new HttpException(
          'User service timeout - biometric login took too long',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }
      throw new HttpException(
        getErrorMessage(error) || 'Biometric login failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid refresh token' })
  @ApiResponse({ status: 401, description: 'Token expired or invalid' })
  async refresh(@Body() body: RefreshTokenDto) {
    try {
      const result = await firstValueFrom(
        this.userService.send({ cmd: 'refresh_token' }, body).pipe(
          timeout(10000)
        ),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new HttpException(
          'User service timeout - token refresh took too long',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }
      if (errorIncludesKeyword(error, 'expired') || errorIncludesKeyword(error, 'invalid')) {
        throw new HttpException('Refresh token expired or invalid', HttpStatus.UNAUTHORIZED);
      }
      throw new HttpException(
        getErrorMessage(error) || 'Token refresh failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({ status: 400, description: 'Invalid email' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    try {
      const result = await firstValueFrom(
        this.userService.send({ cmd: 'forgot_password' }, body).pipe(
          timeout(10000)
        ),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new HttpException(
          'User service timeout - forgot password request took too long',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }
      if (errorIncludesKeyword(error, 'not found')) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        getErrorMessage(error) || 'Forgot password request failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with code' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid code or email' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async resetPassword(@Body() body: ResetPasswordDto) {
    try {
      const result = await firstValueFrom(
        this.userService.send({ cmd: 'reset_password' }, body).pipe(
          timeout(10000)
        ),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new HttpException(
          'User service timeout - password reset took too long',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }
      if (errorIncludesKeyword(error, 'invalid code')) {
        throw new HttpException('Invalid or expired reset code', HttpStatus.BAD_REQUEST);
      }
      if (errorIncludesKeyword(error, 'not found')) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        getErrorMessage(error) || 'Password reset failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and revoke refresh token' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req, @Body() body: { refreshToken: string }) {
    try {
      if (!req.user?.id) {
        throw new HttpException('User not found in request', HttpStatus.UNAUTHORIZED);
      }
      const result = await firstValueFrom(
        this.userService.send({ cmd: 'logout' }, {
          userId: req.user.id,
          refreshToken: body.refreshToken,
        }).pipe(
          timeout(10000)
        ),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new HttpException(
          'User service timeout - logout took too long',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }
      throw new HttpException(
        getErrorMessage(error) || 'Logout failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('logout/all-devices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ status: 200, description: 'Logout from all devices successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logoutAllDevices(@Request() req) {
    try {
      if (!req.user?.id) {
        throw new HttpException('User not found in request', HttpStatus.UNAUTHORIZED);
      }
      const result = await firstValueFrom(
        this.userService.send({ cmd: 'logout_all_devices' }, {
          userId: req.user.id,
        }).pipe(
          timeout(10000)
        ),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new HttpException(
          'User service timeout - logout from all devices took too long',
          HttpStatus.GATEWAY_TIMEOUT,
        );
      }
      throw new HttpException(
        getErrorMessage(error) || 'Logout from all devices failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

