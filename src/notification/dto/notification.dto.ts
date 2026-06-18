import { IsEnum, IsString, IsNotEmpty, IsOptional, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  NotificationTemplateType,
  NotificationChannel,
  RecipientType,
} from '../../common/enums/notification.enum';

export class SendNotificationRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'cust_123', description: 'Customer or delivery partner ID' })
  recipientId: string;

  @IsNotEmpty()
  @IsEnum(RecipientType)
  @ApiProperty({ enum: RecipientType, example: RecipientType.CUSTOMER })
  recipientType: RecipientType;

  @IsNotEmpty()
  @IsEnum(NotificationTemplateType)
  @ApiProperty({ enum: NotificationTemplateType, example: NotificationTemplateType.ORDER_PLACED })
  templateType: NotificationTemplateType;

  @IsOptional()
  @IsObject()
  @ApiProperty({ example: { customerName: 'John', orderId: 'ORD-123' }, required: false })
  variables?: Record<string, string | number>;

  @IsOptional()
  @IsEnum(NotificationChannel)
  @ApiProperty({ enum: NotificationChannel, example: NotificationChannel.BOTH, required: false })
  channel?: NotificationChannel;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Custom Title', required: false })
  customTitle?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'Custom body text', required: false })
  customBody?: string;
}

export class SendCustomNotificationRequestDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'App Update', description: 'Notification title' })
  title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'New features available', description: 'Notification body' })
  body: string;

  @IsNotEmpty()
  @IsEnum(RecipientType)
  @ApiProperty({ 
    enum: RecipientType, 
    example: RecipientType.ALL_CUSTOMERS,
    description: 'ALL_CUSTOMERS or ALL_DELIVERY_PARTNERS to broadcast to all'
  })
  recipientType: RecipientType;

  @IsOptional()
  @IsArray()
  @ApiProperty({ example: ['cust_1', 'cust_2'], required: false, description: 'Specific user IDs (optional)' })
  recipientIds?: string[];

  @IsOptional()
  @IsEnum(NotificationChannel)
  @ApiProperty({ enum: NotificationChannel, example: NotificationChannel.BOTH, required: false })
  channel?: NotificationChannel;
}

export class NotificationResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Notification sent successfully' })
  message: string;

  @ApiProperty({ example: 'msg_123456', required: false })
  messageId?: string;

  @ApiProperty({ example: 150, required: false })
  sentTo?: number;

  @ApiProperty({ example: null, required: false })
  error?: string;
}
