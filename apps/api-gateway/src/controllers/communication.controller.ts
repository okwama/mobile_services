import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('communication')
@Controller('communication')
export class CommunicationController {
  constructor(
    @Inject('COMMUNICATION_SERVICE') private readonly commsService: ClientProxy,
  ) {}

  @Post('send-email')
  @ApiOperation({ summary: 'Send test email' })
  async sendEmail(@Body() body: { to: string; subject: string; html: string }) {
    return firstValueFrom(
      this.commsService.send({ cmd: 'send_email' }, body),
    );
  }

  @Post('send-sms')
  @ApiOperation({ summary: 'Send SMS verification code' })
  async sendVerificationCode(@Body() body: { phoneNumber: string }) {
    return firstValueFrom(
      this.commsService.send({ cmd: 'send_verification_code' }, body),
    );
  }

  @Post('send-password-reset')
  @ApiOperation({ summary: 'Send password reset email' })
  async sendPasswordReset(@Body() body: { to: string; code: string }) {
    return firstValueFrom(
      this.commsService.send({ cmd: 'send_password_reset' }, body),
    );
  }
}

