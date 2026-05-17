import { Controller, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller()
export class AppController {
    constructor(private readonly notificationService: NotificationService) {}

    @Get()
    getHello(): string {
        return `Server is running successfully! Cron hits: ${this.notificationService.cronHitCount}`;
    }
}
