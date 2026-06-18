import {
  NotificationTemplateType,
  NotificationChannel,
  RecipientType,
} from '../enums/notification.enum';

export interface INotificationTemplate {
  id: string;
  type: NotificationTemplateType;
  recipientType: RecipientType;
  channel: NotificationChannel;
  title: string;
  subject?: string; // For email
  emailTemplate?: string; // HTML email template
  pushTitle?: string; // FCM notification title
  pushBody?: string; // FCM notification body
  variables: string[]; // Required variables: ['orderId', 'customerName', 'amount']
  isMandatory: boolean;
  isActive: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INotificationRequest {
  recipientId?: string; // Email or FCM token
  recipientType: RecipientType;
  templateType: NotificationTemplateType;
  variables: Record<string, string | number | boolean>;
  channel?: NotificationChannel;
  customTitle?: string;
  customBody?: string;
}

export interface ICustomNotificationRequest {
  title: string;
  body: string;
  recipientType: RecipientType;
  recipientIds?: string[]; // Specific user IDs, if empty sends to all
}

export interface INotificationResponse {
  success: boolean;
  message: string;
  messageId?: string;
  sentTo?: number; // Count of recipients
  error?: string;
}
