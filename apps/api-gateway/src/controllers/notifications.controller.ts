import { Controller, Get, Put, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    @Inject('COMMUNICATION_SERVICE')
    private readonly communicationService: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async getNotifications(
    @Req() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user?.sub;
    return firstValueFrom(
      this.communicationService.send(
        { cmd: 'get_notifications' },
        { userId, page: page || 1, limit: limit || 20 },
      ),
    );
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread notifications' })
  async getUnreadNotifications(@Req() req: any) {
    const userId = req.user?.sub;
    return firstValueFrom(
      this.communicationService.send(
        { cmd: 'get_unread_notifications' },
        { userId },
      ),
    );
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?.sub;
    return firstValueFrom(
      this.communicationService.send({ cmd: 'get_unread_count' }, { userId }),
    );
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') notificationId: string) {
    return firstValueFrom(
      this.communicationService.send(
        { cmd: 'mark_notification_read' },
        { notificationId: parseInt(notificationId, 10) },
      ),
    );
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?.sub;
    return firstValueFrom(
      this.communicationService.send(
        { cmd: 'mark_all_notifications_read' },
        { userId },
      ),
    );
  }
}

