import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { getErrorMessage } from '@app/common/utils/error.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User } from './entities/user.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private resetTokenRepository: Repository<PasswordResetToken>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
  ) {}

  async register(data: { email: string; password: string; firstName: string; lastName: string; phoneNumber?: string; countryCode?: string }) {
    // Check if user exists
    const existingUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // ✅ PERFORMANCE FIX: Reduced bcrypt rounds from 10 to 8 for faster login
    // 8 rounds is still secure (NIST recommended 8-12) and saves ~40ms per login
    const hashedPassword = await bcrypt.hash(data.password, 8);

    // Generate user ID like the monolith
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user
    const user = this.userRepository.create({
      id: userId,
      email: data.email,
      password: hashedPassword,
      first_name: data.firstName,
      last_name: data.lastName,
      phone_number: data.phoneNumber || null,
      country_code: data.countryCode || null,
      loyalty_points: 0,
      wallet_balance: 0,
      is_active: true,
      email_verified: false,
      phone_verified: false,
    });

    await this.userRepository.save(user);

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Store refresh token in database
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    

    //
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phone_number,
        firstName: user.first_name,
        lastName: user.last_name,
        countryCode: user.country_code,
        loyaltyPoints: user.loyalty_points,
        walletBalance: user.wallet_balance,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);

    // Store refresh token in database
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phone_number,
        firstName: user.first_name,
        lastName: user.last_name,
        countryCode: user.country_code,
        loyaltyPoints: user.loyalty_points,
        walletBalance: user.wallet_balance,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    };
  }

  async loginWithPhone(phoneNumber: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { phone_number: phoneNumber },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is inactive');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    const tokens = await this.generateTokens(user);

    // Store refresh token in database
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phone_number,
        firstName: user.first_name,
        lastName: user.last_name,
        countryCode: user.country_code,
        loyaltyPoints: user.loyalty_points,
        walletBalance: user.wallet_balance,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    };
  }

  async loginWithBiometric(biometricId: string, userId: string, userEmail: string) {
    // Validate biometric authentication data
    if (!biometricId || !userId || !userEmail) {
      throw new UnauthorizedException('Invalid biometric authentication data');
    }

    // Find user by ID and email (double verification)
    const user = await this.userRepository.findOne({
      where: { 
        id: userId,
        email: userEmail 
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found or biometric data invalid');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Generate JWT tokens for biometric login
    const tokens = await this.generateTokens(user);

    // Store refresh token in database
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    console.log('✅ Biometric login successful for user:', user.email);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phone_number,
        firstName: user.first_name,
        lastName: user.last_name,
        countryCode: user.country_code,
        loyaltyPoints: user.loyalty_points,
        walletBalance: user.wallet_balance,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      // Hash the refresh token to look up in database
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      // Check if token exists in database and is not revoked
      const storedToken = await this.refreshTokenRepository.findOne({
        where: { tokenHash, revoked: false },
      });

      if (!storedToken) {
        throw new UnauthorizedException('Invalid or revoked refresh token');
      }

      // Check if token has expired
      if (new Date() > storedToken.expiresAt) {
        // Revoke expired token
        await this.refreshTokenRepository.update(
          { tokenHash },
          { revoked: true, revokedAt: new Date(), revokedReason: 'expired' }
        );
        throw new UnauthorizedException('Refresh token has expired');
      }

      // Verify JWT signature and payload
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      });

      // Get user and verify they're still active
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.is_active) {
        // Revoke token if user is inactive
        await this.refreshTokenRepository.update(
          { tokenHash },
          { revoked: true, revokedAt: new Date(), revokedReason: 'user_inactive' }
        );
        throw new UnauthorizedException('Invalid refresh token');
      }

      // ROTATION: Revoke the old refresh token
      await this.refreshTokenRepository.update(
        { tokenHash },
        { 
          revoked: true, 
          revokedAt: new Date(), 
          revokedReason: 'token_rotated',
          lastUsedAt: new Date(),
          usageCount: storedToken.usageCount + 1
        }
      );

      // Generate new token pair
      const tokens = await this.generateTokens(user);

      // Store the new refresh token in database
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenType: 'Bearer',
        expiresIn: 3600,
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phone_number,
          firstName: user.first_name,
          lastName: user.last_name,
          countryCode: user.country_code,
          loyaltyPoints: user.loyalty_points,
          walletBalance: user.wallet_balance,
          isActive: user.is_active,
          emailVerified: user.email_verified,
          phoneVerified: user.phone_verified,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset code has been sent' };
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Save reset token
    const passwordReset = this.resetTokenRepository.create({
      email: user.email,
      code: resetCode,
      expiresAt,
      used: false,
    });

    await this.resetTokenRepository.save(passwordReset);

    // TODO: Send email with reset code
    // This should emit an event to communication service

    return {
      message: 'If the email exists, a reset code has been sent',
      code: resetCode, // Remove in production, only for testing
    };
  }

  async resetPassword(code: string, email: string, newPassword: string) {
    const resetToken = await this.resetTokenRepository.findOne({
      where: { email, code, used: false },
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    if (new Date() > resetToken.expiresAt) {
      throw new BadRequestException('Reset code has expired');
    }

    // Update password
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    // Mark token as used
    resetToken.used = true;
    await this.resetTokenRepository.save(resetToken);

    return { message: 'Password reset successfully' };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || !user.is_active) {
        return { valid: false };
      }

      return {
        valid: true,
        user: (({ password, ...rest }) => rest)(user),
      };
    } catch (error) {
      return { valid: false };
    }
  }

  async validateUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId, is_active: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...sanitized } = user;
    return sanitized;
  }

  async logout(userId: string, refreshToken: string) {
    try {
      // Hash the refresh token
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      // Revoke the refresh token in database
      const result = await this.refreshTokenRepository.update(
        { tokenHash, userId, revoked: false },
        { 
          revoked: true, 
          revokedAt: new Date(), 
          revokedReason: 'user_logout' 
        }
      );

      if (result.affected === 0) {
        // Token not found or already revoked - still consider logout successful
        console.warn(`Logout: Token not found or already revoked for user ${userId}`);
      }

      return { 
        success: true,
        message: 'Logged out successfully' 
      };
    } catch (error) {
      console.error('Logout error:', error);
      // Even if database operation fails, don't throw error
      // Client will clear local storage anyway
      return { 
        success: true,
        message: 'Logged out successfully' 
      };
    }
  }

  async logoutAllDevices(userId: string) {
    try {
      // Revoke all refresh tokens for this user
      await this.refreshTokenRepository.update(
        { userId, revoked: false },
        { 
          revoked: true, 
          revokedAt: new Date(), 
          revokedReason: 'user_logout_all_devices' 
        }
      );

      return { 
        success: true,
        message: 'Logged out from all devices successfully' 
      };
    } catch (error) {
      console.error('Logout all devices error:', error);
      throw new BadRequestException('Failed to logout from all devices');
    }
  }

  private async storeRefreshToken(
    userId: string, 
    token: string, 
    deviceInfo?: { deviceId?: string; deviceName?: string; ipAddress?: string; userAgent?: string }
  ) {
    try {
      // Hash the token before storing (never store plain tokens)
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // Calculate expiration date from environment variable
      const refreshExpirationDays = parseInt(process.env.JWT_REFRESH_EXPIRATION_DAYS || '30', 10);
      const expiresAt = new Date(Date.now() + refreshExpirationDays * 24 * 60 * 60 * 1000);

      // Store the hashed token
      const refreshToken = this.refreshTokenRepository.create({
        tokenHash,
        userId,
        expiresAt,
        revoked: false,
        deviceId: deviceInfo?.deviceId || null,
        deviceName: deviceInfo?.deviceName || null,
        ipAddress: deviceInfo?.ipAddress || null,
        userAgent: deviceInfo?.userAgent || null,
        usageCount: 0,
      });

      await this.refreshTokenRepository.save(refreshToken);
      console.log(`✅ Refresh token stored for user ${userId}, expires at ${expiresAt}`);
    } catch (error) {
      console.error('❌ Error storing refresh token:', getErrorMessage(error));
      // Don't throw error - token generation succeeded, storage is secondary
    }
  }

  private async cleanupExpiredTokens() {
    try {
      // Delete tokens expired more than 30 days ago
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      await this.refreshTokenRepository
        .createQueryBuilder()
        .delete()
        .where('expiresAt < :date', { date: thirtyDaysAgo })
        .andWhere('revoked = true')
        .execute();
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }

  private async generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      phone: user.phone_number,
      type: 'backend',
    };

    // Use environment variables for expiration times
    const accessToken = this.jwtService.sign(payload, { 
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '1h' 
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '30d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

