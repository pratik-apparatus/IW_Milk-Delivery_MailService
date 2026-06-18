import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): string {
    return "Mail service's server is alive 🌱";
  }
}
