import { Controller, Post, Body, Get, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { SendNotificationDto, CreateReminderDto } from './notification.dto';

@Controller('notifications')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post('send')
    async send(@Body() sendNotificationDto: SendNotificationDto) {
        return await this.notificationService.sendPushNotification(sendNotificationDto);
    }

    @Post('reminder')
    async createOrUpdateReminder(@Body() createReminderDto: CreateReminderDto) {
        return await this.notificationService.createOrUpdateReminder(createReminderDto);
    }

    @Get('reminders')
    async getReminders() {
        return await this.notificationService.getReminders();
    }

    @Delete('reminder/:userId/:appId')
    async deleteReminder(@Param('userId') userId: string, @Param('appId') appId: string) {
        return await this.notificationService.deleteReminder(userId, appId);
    }

    @Get('logs')
    async getLogs() {
        return await this.notificationService.getNotificationLogs();
    }

    // Endpoint to be triggered by Vercel Cron Jobs (or manually)
    @Get('cron')
    async triggerCron() {
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

