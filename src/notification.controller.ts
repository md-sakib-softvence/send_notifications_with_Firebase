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
        await this.notificationService.checkAndSendDailyNotification();
        return { success: true, message: 'Cron job executed successfully' };
    }
}
