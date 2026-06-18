import { Controller, Post, Body, Logger, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { NotificationService } from '../services/notification.service';
import { NotificationTemplateService } from '../services/notification-template.service';
import {
  SendCustomNotificationRequestDto,
  NotificationResponseDto,
} from '../dto/notification.dto';

@ApiTags('Admin - Notifications')
@Controller('admin/notifications')
export class AdminNotificationController {
  private readonly logger = new Logger(AdminNotificationController.name);

  constructor(
    private notificationService: NotificationService,
    private templateService: NotificationTemplateService,
  ) {}

  /**
   * Send custom message to all customers or specific customer IDs
   */
  @Post('send-custom')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send custom notification', description: 'Admin endpoint to send custom messages to all customers, all delivery partners, or specific user IDs' })
  @ApiBody({ type: SendCustomNotificationRequestDto })
  @ApiResponse({ status: 200, type: NotificationResponseDto, description: 'Custom notification sent' })
  async sendCustomNotification(
    @Body() request: SendCustomNotificationRequestDto,
  ): Promise<NotificationResponseDto> {
    try {
      this.logger.log(
        `Admin sending custom notification to ${request.recipientType}`,
      );

      const result = await this.notificationService.sendCustomNotification(
        request,
      );

      return {
        success: result.success,
        message: result.success
          ? `Custom notification sent to ${result.sentTo} recipients`
          : 'Failed to send notifications',
        sentTo: result.sentTo,
        error: result.error,
      };
    } catch (error) {
      this.logger.error('Error in sendCustomNotification:', error);
      return {
        success: false,
        message: 'Error sending custom notification',
        sentTo: 0,
        error: error.message,
      };
    }
  }

  /**
   * Get all notification templates for admin management
   */
  @Get('templates')
  @ApiOperation({ summary: 'Get all notification templates', description: 'Retrieve all notification templates including mandatory and custom ones' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getAllTemplates() {
    try {
      const templates = await this.templateService.findAll();
      return {
        success: true,
        data: templates,
        count: templates.length,
      };
    } catch (error) {
      this.logger.error('Error fetching templates:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get mandatory templates
   */
  @Get('templates/mandatory')
  @ApiOperation({ summary: 'Get mandatory notification templates', description: 'Retrieve only mandatory notification templates defined by the system' })
  @ApiResponse({ status: 200, description: 'Mandatory templates retrieved successfully' })
  async getMandatoryTemplates() {
    try {
      const templates = await this.templateService.findMandatory();
      return {
        success: true,
        data: templates,
        count: templates.length,
      };
    } catch (error) {
      this.logger.error('Error fetching mandatory templates:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Test send notification for template preview
   */
  @Post('templates/test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test template rendering', description: 'Render a template with sample variables to preview how it will look' })
  @ApiResponse({ status: 200, description: 'Template rendered successfully' })
  async testTemplate(
    @Body()
    request: {
      templateType: string;
      variables?: Record<string, string | number>;
      testEmail?: string;
    },
  ): Promise<any> {
    try {
      this.logger.log(`Testing template: ${request.templateType}`);

      const rendered = await this.templateService.getRenderTemplate(
        request.templateType as any,
        request.variables || {},
      );

      return {
        success: true,
        message: 'Template rendered successfully',
        preview: rendered,
      };
    } catch (error) {
      this.logger.error('Error in testTemplate:', error);
      return {
        success: false,
        message: 'Error rendering template',
        error: error.message,
      };
    }
  }
}
