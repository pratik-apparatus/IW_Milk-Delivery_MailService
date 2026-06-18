import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth(): string {
    return this.appService.getHealth();
  }

  @Get('health')
  @ApiTags('Health')
  @ApiOperation({ summary: 'Mail service health check' })
  getHealthStatus() {
    return {
      status: 'healthy',
      service: 'mailServices',
      timestamp: new Date().toISOString(),
    };
  }
}
