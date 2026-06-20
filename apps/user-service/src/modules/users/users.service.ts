import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const { password, ...sanitized } = user;
    return sanitized as User;
  }

  async getUserProfile(userId: string) {
    if (!userId) {
      console.error('getUserProfile called without userId');
      throw new Error('Missing userId');
    }
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let profile = await this.profileRepository.findOne({
      where: { userId },
    });

    // Create profile if doesn't exist
    if (!profile) {
      // Use insert to create a profile with the known primary key (userId).
      // Using `insert` avoids TypeORM attempting a post-insert update when
      // primary keys are non-generated and prevents "entity id is not set" errors.
      try {
        await this.profileRepository.insert({ userId });
      } catch (err: any) {
        // Ignore duplicate-key errors which can occur during a race where another
        // process created the profile between our findOne and insert.
        const isDuplicateKey = err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062);
        if (!isDuplicateKey) {
          console.error('Failed to create user_profile for', userId, err);
          throw err;
        }
      }

      profile = await this.profileRepository.findOne({ where: { userId } });
    }

    const { password, ...sanitizedUser } = user;

    // Return comprehensive profile with all preferences
    return {
      user: {
        ...sanitizedUser,
        // Map snake_case to camelCase for consistency with Flutter
        firstName: user.first_name,
        lastName: user.last_name,
        phoneNumber: user.phone_number,
        countryCode: user.country_code,
        dateOfBirth: user.date_of_birth,
        profileImageUrl: user.profile_image_url,
        loyaltyPoints: user.loyalty_points,
        loyaltyTier: user.loyalty_tier,
        walletBalance: user.wallet_balance,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        phoneVerified: user.phone_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      profile: {
        ...profile,
        // Map snake_case to camelCase
        seatPreference: profile.seat_preference,
        mealPreference: profile.meal_preference,
        specialAssistance: profile.special_assistance,
        emailNotifications: profile.email_notifications,
        smsNotifications: profile.sms_notifications,
        pushNotifications: profile.push_notifications,
        marketingEmails: profile.marketing_emails,
        profileVisible: profile.profile_visible,
        dataSharing: profile.data_sharing,
        locationTracking: profile.location_tracking,
      },
      preferences: {
        language: user.language,
        currency: user.currency,
        timezone: user.timezone,
        theme: user.theme,
        dateOfBirth: user.date_of_birth,
        nationality: user.nationality,
      },
      wallet: {
        balance: parseFloat(String(user.wallet_balance)),
        loyaltyPoints: user.loyalty_points,
        loyaltyTier: user.loyalty_tier,
        currency: user.currency || 'USD',
      },
    };
  }

  async update(id: string, updates: Partial<User>) {
    const user = await this.findById(id);

    // Don't allow direct password updates through this method
    delete updates.password;
    delete updates['email']; // Email changes should be verified

    Object.assign(user, updates);
    await this.userRepository.save(user);

    const { password, ...sanitized } = user;
    return sanitized;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    const sanitizedUsers = users.map(user => {
      const { password, ...sanitized } = user;
      return sanitized;
    });

    return {
      data: sanitizedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async delete(id: string) {
    const user = await this.findById(id);
    
    // Soft delete by marking inactive
    user.is_active = false;
    await this.userRepository.save(user);

    return { message: 'User deactivated successfully' };
  }
}

