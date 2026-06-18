import { Controller } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MailService } from '../mail/mail.service';
import { NotificationService } from '../notification/services/notification.service';
import { RecipientType } from '../common/enums/notification.enum';
import { MailPatterns } from './patterns';
import type { RpcEnvelope } from './rpc.types';
import { assertRpcAuth } from './rpc-auth.util';

@Controller()
export class MailMicroserviceController {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly notificationService: NotificationService,
  ) {}

  private validate(envelope: RpcEnvelope) {
    assertRpcAuth(
      envelope,
      this.configService.get<string>('INTERNAL_SERVICE_TOKEN') || '',
    );
  }

  @MessagePattern(MailPatterns.SEND_PASSWORD_RESET)
  async sendPasswordReset(
    @Payload()
    envelope: RpcEnvelope<{
      to: string;
      resetToken: string;
      frontendUrl?: string;
    }>,
  ) {
    this.validate(envelope);
    await this.mailService.sendPasswordResetEmail(envelope.data);
    return { success: true, message: 'Password reset email sent successfully' };
  }

  @MessagePattern(MailPatterns.SEND_TENANT_CREDENTIALS)
  async sendTenantCredentials(
    @Payload()
    envelope: RpcEnvelope<{
      to: string;
      businessName: string;
      adminEmail: string;
      temporaryPassword: string;
      adminPanelUrl?: string;
      subdomain?: string;
    }>,
  ) {
    this.validate(envelope);
    await this.mailService.sendTenantCredentialsEmail(envelope.data);
    return { success: true, message: 'Tenant credentials email sent successfully' };
  }

  @MessagePattern(MailPatterns.NOTIFICATION_SEND)
  async sendNotification(
    @Payload()
    envelope: RpcEnvelope<{
      recipientId: string;
      recipientType: 'CUSTOMER' | 'DELIVERY_PARTNER';
      templateType: string;
      variables?: Record<string, string | number>;
      channel?: 'EMAIL' | 'FCM' | 'BOTH';
      fcmToken?: string;
    }>,
  ) {
    this.validate(envelope);
    const result = await this.notificationService.sendTemplateNotification(
      envelope.data as any,
    );
    return {
      success: result.success,
      message: result.success
        ? 'Notification sent successfully'
        : 'Failed to send notification',
      messageId: result.messageId,
      error: result.error,
    };
  }

  @MessagePattern(MailPatterns.NOTIFICATION_SEND_BULK)
  async sendBulkNotification(
    @Payload()
    envelope: RpcEnvelope<{
      recipientIds: string[];
      templateType: string;
      variables?: Record<string, string | number>;
    }>,
  ) {
    this.validate(envelope);
    let sentCount = 0;

    for (const recipientId of envelope.data.recipientIds) {
      try {
        const result = await this.notificationService.sendTemplateNotification({
          recipientId,
          recipientType: recipientId.startsWith('c_')
            ? RecipientType.CUSTOMER
            : RecipientType.DELIVERY_PARTNER,
          templateType: envelope.data.templateType as any,
          variables: envelope.data.variables,
        });
        if (result.success) {
          sentCount++;
        }
      } catch {
        // continue bulk send
      }
    }

    return {
      success: sentCount > 0,
      message: `Notifications sent to ${sentCount}/${envelope.data.recipientIds.length} recipients`,
      sentTo: sentCount,
    };
  }

  @MessagePattern(MailPatterns.NOTIFICATION_SEND_CUSTOM)
  async sendCustomNotification(
    @Payload()
    envelope: RpcEnvelope<{
      title: string;
      body: string;
      recipientType: string;
      recipientIds?: string[];
      channel?: 'EMAIL' | 'FCM' | 'BOTH';
    }>,
  ) {
    this.validate(envelope);
    const result = await this.notificationService.sendCustomNotification(
      envelope.data as any,
    );
    return {
      success: result.success,
      message: result.success
        ? `Custom notification sent to ${result.sentTo} recipients`
        : 'Failed to send notifications',
      sentTo: result.sentTo,
      error: result.error,
    };
  }
}
