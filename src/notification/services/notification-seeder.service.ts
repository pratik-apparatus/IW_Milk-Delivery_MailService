import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NotificationTemplateService } from './notification-template.service';

@Injectable()
export class NotificationSeederService implements OnModuleInit {
  private readonly logger = new Logger(NotificationSeederService.name);

  constructor(private templateService: NotificationTemplateService) {}

  /**
   * Run seeder on module initialization
   */
  async onModuleInit() {
    try {
      this.logger.log('Starting notification template seeder...');
      await this.templateService.seedMandatoryTemplates();
    } catch (error) {
      this.logger.error('Error in notification seeder:', error);
      // Don't throw - allow app to continue even if seeding fails
    }
  }
}
