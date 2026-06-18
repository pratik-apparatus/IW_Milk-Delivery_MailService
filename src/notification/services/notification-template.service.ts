import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTemplate } from '../entities/notification-template.entity';
import {
  NotificationTemplateType,
  NotificationChannel,
  RecipientType,
} from '../../common/enums/notification.enum';
import { MANDATORY_TEMPLATES } from '../../common/templates/notification-templates';

@Injectable()
export class NotificationTemplateService {
  private readonly logger = new Logger(NotificationTemplateService.name);

  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
  ) {}

  /**
   * Find template by type
   */
  async findByType(
    type: NotificationTemplateType,
  ): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({
      where: { type, isActive: true },
    });

    if (!template) {
      throw new NotFoundException(
        `Notification template not found for type: ${type}`,
      );
    }

    return template;
  }

  /**
   * Find all templates
   */
  async findAll(): Promise<NotificationTemplate[]> {
    return this.templateRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find all mandatory templates
   */
  async findMandatory(): Promise<NotificationTemplate[]> {
    return this.templateRepository.find({
      where: { isMandatory: true, isActive: true },
    });
  }

  /**
   * Find templates by recipient type
   */
  async findByRecipientType(
    recipientType: RecipientType,
  ): Promise<NotificationTemplate[]> {
    return this.templateRepository.find({
      where: { recipientType, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create a new template
   */
  async create(
    templateData: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate> {
    // Validate unique type
    const existing = await this.templateRepository.findOne({
      where: { type: templateData.type },
    });

    if (existing) {
      throw new BadRequestException(
        `Template with type ${templateData.type} already exists`,
      );
    }

    const template = this.templateRepository.create(templateData);
    return this.templateRepository.save(template);
  }

  /**
   * Update an existing template
   */
  async update(
    id: string,
    updateData: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate> {
    const template = await this.templateRepository.findOne({ where: { id } });

    if (!template) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }

    // Don't allow changing type (it's the unique identifier)
    if (updateData.type && updateData.type !== template.type) {
      throw new BadRequestException('Cannot change template type');
    }

    Object.assign(template, updateData);
    return this.templateRepository.save(template);
  }

  /**
   * Delete a template
   */
  async delete(id: string): Promise<void> {
    const result = await this.templateRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Template with id ${id} not found`);
    }
  }

  /**
   * Seed mandatory templates on startup
   */
  async seedMandatoryTemplates(): Promise<void> {
    try {
      const existingCount = await this.templateRepository.count();

      if (existingCount > 0) {
        this.logger.log('Templates already exist, skipping seed');
        return;
      }

      const templatesWithoutId = MANDATORY_TEMPLATES.map(
        ({ id, ...rest }) => rest,
      );

      await this.templateRepository.insert(templatesWithoutId);
      this.logger.log(
        `Successfully seeded ${MANDATORY_TEMPLATES.length} notification templates`,
      );
    } catch (error) {
      this.logger.error('Error seeding notification templates:', error);
      throw error;
    }
  }

  /**
   * Replace template variables with actual values
   */
  replaceVariables(
    template: string | null | undefined,
    variables: Record<string, string | number>,
  ): string {
    if (!template) {
      return '';
    }

    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Get rendered template with variables substituted
   */
  async getRenderTemplate(
    type: NotificationTemplateType,
    variables: Record<string, string | number>,
  ): Promise<{
    title: string;
    subject: string;
    pushTitle: string;
    pushBody: string;
    emailTemplate: string;
  }> {
    const template = await this.findByType(type);

    return {
      title: this.replaceVariables(template.title, variables),
      subject: this.replaceVariables(template.subject, variables),
      pushTitle: this.replaceVariables(template.pushTitle, variables),
      pushBody: this.replaceVariables(template.pushBody, variables),
      emailTemplate: this.replaceVariables(template.emailTemplate, variables),
    };
  }
}
