import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { USER_SERVICE_PATTERNS } from '@app/common';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USER_SERVICE_PATTERNS.GET_USER)
  async getUser(@Payload() data: { userId: string }) {
    return this.usersService.findById(data.userId);
  }

  @MessagePattern(USER_SERVICE_PATTERNS.GET_USER_PROFILE)
  async getUserProfile(@Payload() data: { userId: string }) {
    return this.usersService.getUserProfile(data.userId);
  }

  @MessagePattern(USER_SERVICE_PATTERNS.UPDATE_USER)
  async updateUser(@Payload() data: { userId: string; updates: any }) {
    return this.usersService.update(data.userId, data.updates);
  }

  @MessagePattern({ cmd: 'get_all_users' })
  async getAllUsers(@Payload() data: { page?: number; limit?: number }) {
    return this.usersService.findAll(data.page, data.limit);
  }

  @MessagePattern({ cmd: 'delete_user' })
  async deleteUser(@Payload() data: { userId: string }) {
    return this.usersService.delete(data.userId);
  }
}

