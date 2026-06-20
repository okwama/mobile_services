import { Controller, Get, Put, Delete, Body, Param, Query, Inject, UseGuards, Headers } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { USER_SERVICE_PATTERNS } from '@app/common';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    @Inject('USER_SERVICE') private readonly userService: ClientProxy,
  ) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Query('userId') userId: string, @Headers('authorization') auth?: string) {
    // If caller didn't provide a userId, attempt to derive it from JWT in the
    // Authorization header (common pattern for "me" endpoints).
    if (!userId && auth) {
      try {
        const token = auth.replace(/^Bearer\s+/i, '').trim();
        const parts = token.split('.');
        if (parts.length >= 2) {
          const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
          if (payload && payload.sub) {
            userId = payload.sub;
          }
        }
      } catch (e) {
        // ignore decode errors; downstream will handle missing userId
      }
    }

    return firstValueFrom(
      this.userService.send(USER_SERVICE_PATTERNS.GET_USER_PROFILE, { userId }),
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
  @ApiOperation({ summary: 'Update user' })
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

