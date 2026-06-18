import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationTemplate } from './entities/notification-template.entity';
import { NotificationTemplateService } from './services/notification-template.service';
import { NotificationSeederService } from './services/notification-seeder.service';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { AdminNotificationController } from './controllers/admin-notification.controller';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationTemplate]), FirebaseModule],
  controllers: [NotificationController, AdminNotificationController],
  providers: [NotificationTemplateService, NotificationSeederService, NotificationService],
  exports: [NotificationService, NotificationTemplateService],
})
export class NotificationModule {}
