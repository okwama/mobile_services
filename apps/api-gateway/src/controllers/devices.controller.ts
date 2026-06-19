import { Controller, Post, Body, UseGuards, Request, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { firstValueFrom } from 'rxjs';

@ApiTags('devices')
@Controller('devices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DevicesController {
  constructor(
    @Inject('COMMUNICATION_SERVICE') private readonly commsService: ClientProxy,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register device token for push notifications' })
  async registerDevice(
    @Body() body: {
      userId: string;
      playerId: string;
      deviceType: 'android' | 'ios' | 'web';
      deviceModel?: string;
      osVersion?: string;
      appVersion?: string;
    },
    @Request() req,
  ) {
    // Ensure user can only register their own device
    if (body.userId !== req.user.sub) {
      return {
        success: false,
        message: 'Unauthorized: Can only register your own device',
      };
    }

    return firstValueFrom(
      this.commsService.send({ cmd: 'register_device_token' }, body),
    );
  }

  @Post('unregister')
  @ApiOperation({ summary: 'Unregister device token' })
  async unregisterDevice(@Body() body: { playerId: string }) {
    return firstValueFrom(
      this.commsService.send({ cmd: 'unregister_device_token' }, body),
    );
  }

  @Post('test-notification')
  @ApiOperation({ summary: 'Send test push notification' })
  async sendTestNotification(@Request() req) {
    return firstValueFrom(
      this.commsService.send({ cmd: 'send_test_notification' }, { userId: req.user.sub }),
    );
  }
}

