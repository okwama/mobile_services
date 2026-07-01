import { Controller, Get, Put, Delete, Body, Param, Query, Inject, Headers } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { USER_SERVICE_PATTERNS } from '@app/common';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  private extractUserId(auth?: string): string {
    if (!auth) return '';
    try {
      const token = auth.replace(/^Bearer\s+/i, '').trim();
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
        return payload?.sub || '';
      }
    } catch { }
    return '';
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Query('userId') userId: string, @Headers('authorization') auth?: string) {
    if (!userId && auth) {
      userId = this.extractUserId(auth);
    }
    return firstValueFrom(
      this.userService.send(USER_SERVICE_PATTERNS.GET_USER_PROFILE, { userId }),
    );
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update authenticated user profile' })
  async updateProfile(@Body() body: any, @Headers('authorization') auth?: string) {
    const userId = this.extractUserId(auth);
    return firstValueFrom(
      this.userService.send({ cmd: 'update_profile' }, { userId, ...body }),
    );
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user app preferences (language, currency, timezone, theme, notifications)' })
  async updatePreferences(@Body() body: any, @Headers('authorization') auth?: string) {
    const userId = this.extractUserId(auth);
    return firstValueFrom(
      this.userService.send({ cmd: 'update_preferences' }, { userId, ...body }),
    );
  }

  @Put('password')
  @ApiOperation({ summary: 'Change authenticated user password' })
  async changePassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @Headers('authorization') auth?: string,
  ) {
    const userId = this.extractUserId(auth);
    return firstValueFrom(
      this.userService.send({ cmd: 'change_password' }, { userId, ...body }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUser(@Param('id') id: string) {
    return firstValueFrom(
      this.userService.send(USER_SERVICE_PATTERNS.GET_USER, { userId: id }),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user (admin)' })
  async updateUser(@Param('id') id: string, @Body() updates: any) {
    return firstValueFrom(
      this.userService.send(USER_SERVICE_PATTERNS.UPDATE_USER, { userId: id, updates }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (paginated)' })
  async getAllUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return firstValueFrom(
      this.userService.send({ cmd: 'get_all_users' }, { page, limit }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id') id: string) {
    return firstValueFrom(
      this.userService.send({ cmd: 'delete_user' }, { userId: id }),
    );
  }
}

