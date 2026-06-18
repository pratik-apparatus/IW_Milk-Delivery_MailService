import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { NotificationModule } from '../notification/notification.module';
import { MailMicroserviceController } from './mail.microservice.controller';

@Module({
  imports: [MailModule, NotificationModule],
  controllers: [MailMicroserviceController],
})
export class MicroservicesModule {}
