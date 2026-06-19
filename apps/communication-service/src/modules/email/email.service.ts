import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private mailtrapApiKey: string;
  private mailtrapBaseUrl = 'https://send.api.mailtrap.io/api/send';
  private infobipApiKey: string;
  private infobipBaseUrl: string;

  constructor(private configService: ConfigService) {
    this.mailtrapApiKey = this.configService.get<string>('MAILTRAP_API_KEY');
    this.infobipApiKey = this.configService.get<string>('INFOBIP_API_KEY');
    this.infobipBaseUrl = this.configService.get<string>('INFOBIP_BASE_URL') || 'https://rpdjky.api.infobip.com';
    
    if (!this.mailtrapApiKey && !this.infobipApiKey) {
      this.logger.warn('Neither MAILTRAP_API_KEY nor INFOBIP_API_KEY configured. Email service will be disabled.');
    }
  }

  async sendBookingConfirmation(data: any): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const subject = `Booking Confirmed - ${data.referenceNumber}`;
    const html = this.generateBookingConfirmationHtml(data);

    return this.sendEmailWithFallback(
      data.to,
      subject,
      html,
      'admin@aircharterss.com',
      'Air Charters'
    );
  }

  async sendPasswordResetEmail(to: string, code: string): Promise<{ success: boolean }> {
    const subject = 'Password Reset Code - Air Charters';
    const html = `
      <h2>Password Reset Request</h2>
      <p>Your password reset code is: <strong>${code}</strong></p>
      <p>This code expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    const result = await this.sendEmailWithFallback(to, subject, html);
    return { success: result.success };
  }

  async sendPaymentConfirmation(data: any): Promise<{ success: boolean }> {
    const subject = `Payment Received - ${data.referenceNumber}`;
    const html = `
      <h2>Payment Confirmed</h2>
      <p>We've received your payment of ${data.currency} ${data.amount}.</p>
      <p>Booking Reference: ${data.referenceNumber}</p>
    `;

    const result = await this.sendEmailWithFallback(data.to, subject, html);
    return { success: result.success };
  }

  async sendBookingInquiryEmail(data: any): Promise<{ success: boolean }> {
    const { companyEmail, bookingId, referenceNumber, customerName, customerEmail, aircraftName, experienceTitle, bookingType, origin, destination, departureDate, passengerCount } = data;
    
    if (!companyEmail) {
      this.logger.warn('No company email provided for booking inquiry notification');
      return { success: false };
    }

    const subject = bookingType === 'experience' ? `New Experience Booking - ${referenceNumber}` : `New Charter Inquiry - ${referenceNumber}`;
    const html = this.generateInquiryNotificationHtml({
      referenceNumber,
      customerName,
      customerEmail,
      aircraftName,
      experienceTitle,
      bookingType,
      origin: origin || 'Not specified',
      destination: destination || 'Not specified',
      departureDate: departureDate ? new Date(departureDate).toLocaleString() : 'Not specified',
      passengerCount: passengerCount || 1,
    });

    const result = await this.sendEmailWithFallback(companyEmail, subject, html);
    if (result.success) {
      this.logger.log(`Inquiry notification sent to company: ${companyEmail} for ${referenceNumber}`);
    }
    return { success: result.success };
  }

  private generateInquiryNotificationHtml(data: {
    referenceNumber: string;
    customerName: string;
    customerEmail: string;
    aircraftName?: string;
    experienceTitle?: string;
    bookingType?: string;
    origin: string;
    destination: string;
    departureDate: string;
    passengerCount: number;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          h2 { color: #FF6B35; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          strong { color: #333; }
          .header { background: #FF6B35; color: white; padding: 20px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${data.bookingType === 'experience' ? 'New Experience Booking' : 'New Charter Inquiry'}</h1>
        </div>
        <h2>${data.bookingType === 'experience' ? 'Booking' : 'Inquiry'} Details</h2>
        <table>
          <tr><td><strong>Reference Number:</strong></td><td>${data.referenceNumber}</td></tr>
          <tr><td><strong>Customer Name:</strong></td><td>${data.customerName}</td></tr>
          <tr><td><strong>Customer Email:</strong></td><td>${data.customerEmail}</td></tr>
          ${data.bookingType === 'experience' 
            ? `<tr><td><strong>Experience:</strong></td><td>${data.experienceTitle || 'N/A'}</td></tr>` 
            : `<tr><td><strong>Aircraft:</strong></td><td>${data.aircraftName || 'N/A'}</td></tr>
               <tr><td><strong>From:</strong></td><td>${data.origin || 'N/A'}</td></tr>
               <tr><td><strong>To:</strong></td><td>${data.destination || 'N/A'}</td></tr>`
          }
          <tr><td><strong>Date:</strong></td><td>${data.departureDate || 'N/A'}</td></tr>
          <tr><td><strong>Passengers:</strong></td><td>${data.passengerCount}</td></tr>
        </table>
        <p>${data.bookingType === 'experience' 
          ? 'Please confirm this booking and prepare for the experience.' 
          : 'Please review this inquiry and provide a quote to the customer as soon as possible.'
        }</p>
        <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          This is an automated notification from Air Charters.
        </p>
      </body>
      </html>
    `;
  }

  private generateBookingConfirmationHtml(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Booking Confirmed!</h2>
        <p>Dear ${data.passengerName},</p>
        <p>Your booking has been confirmed.</p>
        
        <h3>Booking Details:</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td><strong>Reference:</strong></td><td>${data.referenceNumber}</td></tr>
          <tr><td><strong>From:</strong></td><td>${data.departure}</td></tr>
          <tr><td><strong>To:</strong></td><td>${data.destination}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${data.date}</td></tr>
          <tr><td><strong>Time:</strong></td><td>${data.time}</td></tr>
          <tr><td><strong>Aircraft:</strong></td><td>${data.aircraft}</td></tr>
          <tr><td><strong>Company:</strong></td><td>${data.company}</td></tr>
          <tr><td><strong>Total:</strong></td><td>$${data.totalAmount}</td></tr>
        </table>
        
        <p>Thank you for choosing Air Charters!</p>
      </body>
      </html>
    `;
  }

  async sendEmailWithFallback(
    to: string,
    subject: string,
    htmlContent: string,
    fromEmail: string = 'admin@aircharterss.com',
    fromName: string = 'Air Charters'
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Try Mailtrap first
    if (this.mailtrapApiKey) {
      try {
        const result = await axios.post(this.mailtrapBaseUrl, {
          from: { email: fromEmail, name: fromName },
          to: [{ email: to }],
          subject: subject,
          html: htmlContent,
        }, {
          headers: {
            'Authorization': `Bearer ${this.mailtrapApiKey}`,
            'Content-Type': 'application/json'
          }
        });

        this.logger.log(`Email sent via Mailtrap to ${to}`);
        return { success: true, messageId: result.data?.message_id };
      } catch (error) {
        this.logger.warn(`Mailtrap failed, trying Infobip: ${error.message}`);
      }
    }

    // Fallback to Infobip
    if (this.infobipApiKey) {
      try {
        const result = await axios.post(`${this.infobipBaseUrl}/email/3/send`, {
          from: fromEmail,
          to: to,
          subject: subject,
          html: htmlContent,
        }, {
          headers: {
            'Authorization': `App ${this.infobipApiKey}`,
            'Content-Type': 'application/json'
          }
        });

        this.logger.log(`Email sent via Infobip to ${to}`);
        return { success: true, messageId: result.data?.bulkId };
      } catch (error) {
        this.logger.error(`Email failed: ${error.message}`);
        return { success: false, error: error.message };
      }
    }

    return { success: false, error: 'No email service configured' };
  }
}

