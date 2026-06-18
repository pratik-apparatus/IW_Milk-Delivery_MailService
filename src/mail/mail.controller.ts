import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { MailService } from './mail.service';

interface SendPasswordResetEmailDto {
  to: string;
  resetToken: string;
  frontendUrl?: string;
}

interface SendTenantCredentialsDto {
  to: string;
  businessName: string;
  adminEmail: string;
  temporaryPassword: string;
  adminPanelUrl?: string;
  subdomain?: string;
}

@Controller('mail')
export class MailController {
  private readonly logger = new Logger('MailController');

  constructor(private readonly mailService: MailService) {}

  @Post('send-password-reset')
  async sendPasswordResetEmail(
    @Body() dto: SendPasswordResetEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { to, resetToken, frontendUrl } = dto;

      if (!to || !resetToken) {
        throw new HttpException(
          {
            success: false,
            message: 'Missing required fields: to and resetToken are required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.mailService.sendPasswordResetEmail({
        to,
        resetToken,
        frontendUrl,
      });

      return {
        success: true,
        message: 'Password reset email sent successfully',
      };
    } catch (error) {
      this.logger.error('Error in sendPasswordResetEmail:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to send password reset email',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send-tenant-credentials')
  async sendTenantCredentials(
    @Body() dto: SendTenantCredentialsDto,
  ): Promise<{ success: boolean; message: string }> {
    const required = ['to', 'businessName', 'adminEmail', 'temporaryPassword'];
    for (const field of required) {
      if (!(dto as any)[field]) {
        throw new HttpException(
          { success: false, message: `Missing required field: ${field}` },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    await this.mailService.sendTenantCredentialsEmail(dto);
    return { success: true, message: 'Tenant credentials email sent successfully' };
  }
}
