import { Controller, Post, Body, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { RecipientType } from '../../common/enums/notification.enum';
import {
  SendNotificationRequestDto,
  NotificationResponseDto,
} from '../dto/notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private notificationService: NotificationService) {}

  /**
   * Send notification using predefined template
   * Called by main backend service when events occur
   */
  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send notification to single recipient', description: 'Send a notification using a predefined template to a single customer or delivery partner' })
  @ApiBody({ type: SendNotificationRequestDto })
  @ApiResponse({ status: 200, type: NotificationResponseDto, description: 'Notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  async sendNotification(
    @Body() request: SendNotificationRequestDto,
  ): Promise<NotificationResponseDto> {
    try {
      this.logger.log(
        `Sending ${request.templateType} notification to ${request.recipientId}`,
      );

      const result = await this.notificationService.sendTemplateNotification(
        request,
      );

      return {
        success: result.success,
        message: result.success
          ? 'Notification sent successfully'
          : 'Failed to send notification',
        messageId: result.messageId,
        error: result.error,
      };
    } catch (error) {
      this.logger.error('Error in sendNotification:', error);
      return {
        success: false,
        message: 'Error sending notification',
        error: error.message,
      };
    }
  }

  /**
   * Bulk send notification to multiple recipients using template
   */
  @Post('send-bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send notifications to multiple recipients', description: 'Send a notification using a predefined template to multiple customers or delivery partners' })
  @ApiResponse({ status: 200, description: 'Notifications sent' })
  async sendBulkNotification(
    @Body()
    request: {
      recipientIds: string[];
      templateType: string;
      variables?: Record<string, string | number>;
    },
  ): Promise<NotificationResponseDto> {
    try {
      this.logger.log(
        `Sending bulk ${request.templateType} notifications to ${request.recipientIds.length} recipients`,
      );

      let sentCount = 0;

      for (const recipientId of request.recipientIds) {
        try {
          const result = await this.notificationService.sendTemplateNotification(
            {
              recipientId,
              recipientType: recipientId.startsWith('c_')
                ? RecipientType.CUSTOMER
                : RecipientType.DELIVERY_PARTNER,
              templateType: request.templateType as any,
              variables: request.variables,
            },
          );

          if (result.success) {
            sentCount++;
          }
        } catch (error) {
          this.logger.warn(
            `Failed to send to ${recipientId}:`,
            error.message,
          );
        }
      }

      return {
        success: sentCount > 0,
        message: `Notifications sent to ${sentCount}/${request.recipientIds.length} recipients`,
        sentTo: sentCount,
      };
    } catch (error) {
      this.logger.error('Error in sendBulkNotification:', error);
      return {
        success: false,
        message: 'Error sending bulk notifications',
        error: error.message,
      };
    }
  }
}
