import { Controller, Post, Body, Get } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNotificationDto } from './notification.dto';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post('send')
    async send(@Body() sendNotificationDto: SendNotificationDto) {
        return await this.notificationService.sendPushNotification(sendNotificationDto);
    }

    // Endpoint to be triggered by Vercel Cron Jobs (or manually)
    @Get('cron')
    async triggerCron() {
        console.log("hite")
        this.notificationService.cronHitCount++;
        await this.notificationService.checkAndSendDailyNotification1();
        return { success: true, message: 'Cron job executed successfully' };
    }

    // Endpoint to check if the background cron is running
    @Get('status')
    getStatus() {
        return { 
            status: 'online', 
            cronRunCount: this.notificationService.cronHitCount 
        };
    }
}
