import { Injectable, Logger } from '@nestjs/common';
import { getErrorMessage } from '@app/common/utils/error.utils';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private infobipApiKey: string;
  private infobipBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.infobipApiKey = this.configService.get<string>('INFOBIP_API_KEY');
    this.infobipBaseUrl = this.configService.get<string>('INFOBIP_BASE_URL') || 'https://rpdjky.api.infobip.com';
    
    if (!this.infobipApiKey) {
      this.logger.warn('INFOBIP_API_KEY not configured. SMS service will be disabled.');
    }
  }

  async sendVerificationCode(phoneNumber: string): Promise<{ success: boolean; message: string; code?: string }> {
    if (!this.infobipApiKey) {
      this.logger.error('Infobip not initialized.');
      return { success: false, message: 'SMS service not configured' };
    }

    try {
      this.logger.log(`Sending verification code to: ${phoneNumber}`);
      
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      const result = await axios.post(`${this.infobipBaseUrl}/sms/2/text/single`, {
        from: 'AirCharters',
        to: phoneNumber,
        text: `Your Air Charters verification code is: ${verificationCode}. This code expires in 10 minutes.`
      }, {
        headers: {
          'Authorization': `App ${this.infobipApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log(`Verification code sent to ${phoneNumber}`);
      
      return {
        success: true,
        message: 'Verification code sent successfully',
        code: verificationCode, // Return for testing
      };
    } catch (error) {
      const msg = getErrorMessage(error);
      this.logger.error('Infobip SMS error:', msg);
      return {
        success: false,
        message: `Failed to send SMS: ${msg}`,
      };
    }
  }

  async sendBookingNotification(phoneNumber: string, referenceNumber: string): Promise<{ success: boolean }> {
    if (!this.infobipApiKey) {
      return { success: false };
    }

    try {
      await axios.post(`${this.infobipBaseUrl}/sms/2/text/single`, {
        from: 'AirCharters',
        to: phoneNumber,
        text: `Your booking ${referenceNumber} has been confirmed. Thank you for choosing Air Charters!`
      }, {
        headers: {
          'Authorization': `App ${this.infobipApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return { success: true };
    } catch (error) {
      this.logger.error('SMS notification failed:', getErrorMessage(error));
      return { success: false };
    }
  }

  async sendInquiryNotificationSms(data: {
    companyPhone: string;
    referenceNumber: string;
    customerName: string;
    aircraftName: string;
    passengerCount: number;
  }): Promise<{ success: boolean }> {
    if (!this.infobipApiKey) {
      this.logger.warn('INFOBIP_API_KEY not configured. SMS service will be disabled.');
      return { success: false };
    }

    const { companyPhone, referenceNumber, customerName, aircraftName, passengerCount } = data;

    if (!companyPhone) {
      this.logger.warn('No company phone provided for inquiry notification');
      return { success: false };
    }

    try {
      const smsText = `New charter inquiry ${referenceNumber}: ${customerName} requests ${passengerCount} seats on ${aircraftName}. Check your email for details.`;
      
      const result = await axios.post(`${this.infobipBaseUrl}/sms/2/text/single`, {
        from: 'AirCharters',
        to: companyPhone,
        text: smsText
      }, {
        headers: {
          'Authorization': `App ${this.infobipApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log(`Inquiry SMS sent to company: ${companyPhone} for ${referenceNumber}`);
      return { success: true };
    } catch (error) {
      this.logger.error(`SMS notification failed: ${getErrorMessage(error)}`);
      return { success: false };
    }
  }
}

