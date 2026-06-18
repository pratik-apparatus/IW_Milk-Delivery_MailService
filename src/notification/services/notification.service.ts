import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../../firebase/firebase.service';
import { NotificationTemplateService } from './notification-template.service';
import {
  NotificationTemplateType,
  NotificationChannel,
  RecipientType,
} from '../../common/enums/notification.enum';
import { SendNotificationRequestDto, SendCustomNotificationRequestDto } from '../dto/notification.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private firebaseService: FirebaseService,
    private templateService: NotificationTemplateService,
    private configService: ConfigService,
  ) {
    this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter (Nodemailer)
   */
  private initializeEmailTransporter() {
    const emailConfig = {
      host: this.configService.get('SMTP_HOST', 'localhost'),
      port: parseInt(this.configService.get('SMTP_PORT', '1025'), 10),
      secure: this.configService.get('SMTP_SECURE', 'false') === 'true',
      auth:
        this.configService.get('SMTP_USER') &&
        this.configService.get('SMTP_PASSWORD')
          ? {
              user: this.configService.get('SMTP_USER'),
              pass: this.configService.get('SMTP_PASSWORD'),
            }
          : undefined,
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  /**
   * Send notification via template
   */
  async sendTemplateNotification(
    request: SendNotificationRequestDto,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const { recipientId, recipientType, templateType, variables = {}, channel } = request;

      // Get template
      const template = await this.templateService.findByType(templateType);

      // Render template with variables
      const renderedTemplate = await this.templateService.getRenderTemplate(
        templateType,
        variables,
      );

      // Determine channels to use
      const channels = channel ? [channel] : [template.channel];

      // Send via each channel
      const results = [];

      for (const notificationChannel of channels) {
        if (notificationChannel === NotificationChannel.FCM || notificationChannel === NotificationChannel.BOTH) {
          try {
            const fcmResult = await this.sendFCMNotification(
              recipientId,
              renderedTemplate.pushTitle,
              renderedTemplate.pushBody,
            );
            results.push(fcmResult);
          } catch (error) {
            this.logger.warn(`FCM notification failed for ${recipientId}:`, error.message);
          }
        }

        if (notificationChannel === NotificationChannel.EMAIL || notificationChannel === NotificationChannel.BOTH) {
          try {
            // For email, we need recipient email address - would be fetched from database in real implementation
            const emailResult = await this.sendEmailNotification(
              recipientId,
              renderedTemplate.subject,
              renderedTemplate.emailTemplate,
            );
            results.push(emailResult);
          } catch (error) {
            this.logger.warn(`Email notification failed for ${recipientId}:`, error.message);
          }
        }
      }

      return {
        success: results.length > 0,
        messageId: results[0]?.messageId,
      };
    } catch (error) {
      this.logger.error('Error sending template notification:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send custom notification to multiple recipients
   */
  async sendCustomNotification(
    request: SendCustomNotificationRequestDto,
  ): Promise<{
    success: boolean;
    sentTo: number;
    error?: string;
  }> {
    try {
      const { title, body, recipientType, recipientIds, channel } = request;

      const notificationChannels = channel ? [channel] : [NotificationChannel.BOTH];

      let sentCount = 0;

      // If no specific recipients, would broadcast to all of type
      const targetIds = recipientIds && recipientIds.length > 0
        ? recipientIds
        : await this.getAllRecipientIds(recipientType);

      for (const recipientId of targetIds) {
        for (const notificationChannel of notificationChannels) {
          try {
            if (notificationChannel === NotificationChannel.FCM || notificationChannel === NotificationChannel.BOTH) {
              await this.sendFCMNotification(recipientId, title, body);
              sentCount++;
            }

            if (notificationChannel === NotificationChannel.EMAIL || notificationChannel === NotificationChannel.BOTH) {
              await this.sendEmailNotification(
                recipientId,
                title,
                `<h2>${title}</h2><p>${body}</p>`,
              );
              sentCount++;
            }
          } catch (error) {
            this.logger.warn(
              `Failed to send custom notification to ${recipientId}:`,
              error.message,
            );
          }
        }
      }

      return {
        success: sentCount > 0,
        sentTo: sentCount,
      };
    } catch (error) {
      this.logger.error('Error sending custom notification:', error);
      return {
        success: false,
        sentTo: 0,
        error: error.message,
      };
    }
  }

  /**
   * Send notification via FCM (Firebase Cloud Messaging)
   */
  private async sendFCMNotification(
    recipientId: string,
    title: string,
    body: string,
  ): Promise<{ messageId: string }> {
    if (!this.firebaseService.isReady()) {
      throw new Error('Firebase service not initialized');
    }

    // In real implementation, would fetch FCM token from database for recipientId
    // For now, return success response
    this.logger.log(
      `FCM notification prepared for ${recipientId}: ${title}`,
    );

    return {
      messageId: `fcm_${Date.now()}_${recipientId}`,
    };
  }

  /**
   * Send notification via Email
   */
  private async sendEmailNotification(
    recipientId: string,
    subject: string,
    htmlContent: string,
  ): Promise<{ messageId: string }> {
    try {
      // In real implementation, would fetch email address from database for recipientId
      const email = `${recipientId}@example.com`; // Placeholder

      const info = await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM_EMAIL', 'noreply@milkdelivery.com'),
        to: email,
        subject: subject,
        html: htmlContent,
      });

      this.logger.log(`Email sent to ${email}: ${info.messageId}`);

      return { messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Error sending email to ${recipientId}:`, error);
      throw error;
    }
  }

  /**
   * Get all recipient IDs of a specific type
   * In real implementation, would query database
   */
  private async getAllRecipientIds(
    recipientType: RecipientType,
  ): Promise<string[]> {
    // Placeholder - in real implementation would query database
    this.logger.log(
      `Would fetch all ${recipientType} recipients from database`,
    );
    return [];
  }
}
