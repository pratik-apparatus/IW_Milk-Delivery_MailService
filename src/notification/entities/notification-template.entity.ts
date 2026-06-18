import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  NotificationTemplateType,
  NotificationChannel,
  RecipientType,
} from '../../common/enums/notification.enum';

@Entity('notificationtemplate')
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationTemplateType,
    unique: true,
  })
  type: NotificationTemplateType;

  @Column({
    type: 'enum',
    enum: RecipientType,
  })
  recipientType: RecipientType;

  @Column({
    type: 'enum',
    enum: NotificationChannel,
    default: NotificationChannel.BOTH,
  })
  channel: NotificationChannel;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 255, nullable: true })
  subject: string;

  @Column({ length: 200, nullable: true })
  pushTitle: string;

  @Column({ type: 'text', nullable: true })
  pushBody: string;

  @Column({ type: 'text', nullable: true })
  emailTemplate: string;

  @Column({
    type: 'json',
    default: [],
  })
  variables: string[];

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({ default: true })
  isMandatory: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
