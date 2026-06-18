import { Injectable } from '@nestjs/common';
import { transporter } from '../config/mail';

export interface SendPasswordResetEmailParams {
  to: string;
  resetToken: string;
  frontendUrl?: string;
}

@Injectable()
export class MailService {
  async sendTenantCredentialsEmail(params: {
    to: string;
    businessName: string;
    adminEmail: string;
    temporaryPassword: string;
    adminPanelUrl?: string;
    subdomain?: string;
  }): Promise<void> {
    const adminPanelUrl =
      params.adminPanelUrl ||
      process.env.ADMIN_PANEL_URL ||
      'http://localhost:7000/admin/login';

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@milkdelivery.com',
      to: params.to,
      subject: `Welcome to Milk Delivery - ${params.businessName}`,
      html: `
        <h2>Your tenant is ready</h2>
        <p>Hello,</p>
        <p>Your Milk Delivery tenant <strong>${params.businessName}</strong> has been provisioned successfully.</p>
        <p><strong>Admin email:</strong> ${params.adminEmail}</p>
        <p><strong>Temporary password:</strong> ${params.temporaryPassword}</p>
        <p><strong>Subdomain:</strong> ${params.subdomain || 'N/A'}</p>
        <p><a href="${adminPanelUrl}">Open Admin Panel</a></p>
        <p>Please change your password after first login.</p>
      `,
      text: `Tenant ${params.businessName} is ready. Admin: ${params.adminEmail}. Temp password: ${params.temporaryPassword}. Login: ${adminPanelUrl}`,
    };

    await transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail({
    to,
    resetToken,
    frontendUrl = process.env.FRONTEND_URL || 'http://localhost:7000',
  }: SendPasswordResetEmailParams): Promise<void> {
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@milkdelivery.com',
      to,
      subject: 'Password Reset Request - Milk Delivery',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin-top: 0; text-align: center;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>You have requested to reset your password for your Milk Delivery account.</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto;">
              <tr>
                <td style="background-color: #4CAF50; border-radius: 8px; text-align: center;">
                  <a href="${resetLink}" 
                     style="display: inline-block; padding: 15px 40px; color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 8px;">
                    🔐 Reset Password
                  </a>
                </td>
              </tr>
            </table>
            <p style="text-align: center; color: #666; font-size: 14px; margin-top: 20px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #666; font-size: 12px; text-align: center; background-color: #f9f9f9; padding: 10px; border-radius: 4px;">${resetLink}</p>
            <p><strong>This link will expire in 15 minutes.</strong></p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #666; font-size: 12px; margin-bottom: 0;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request - Milk Delivery
        
        Hello,
        
        You have requested to reset your password for your Milk Delivery account.
        
        Click the link below to reset your password:
        ${resetLink}
        
        This link will expire in 15 minutes.
        
        If you did not request this password reset, please ignore this email.
        
        This is an automated message, please do not reply to this email.
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Password reset email sent:', info.messageId);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
