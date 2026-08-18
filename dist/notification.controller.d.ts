import { NotificationService } from './notification.service';
import { SendNotificationDto, CreateReminderDto } from './notification.dto';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    send(sendNotificationDto: SendNotificationDto): Promise<{
        success: boolean;
        messageId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        messageId?: undefined;
    }>;
    createOrUpdateReminder(createReminderDto: CreateReminderDto): Promise<{
        success: boolean;
        id: any;
    }>;
    getReminders(): Promise<any[]>;
    deleteReminder(userId: string, appId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getLogs(): Promise<any[]>;
    triggerCron(): Promise<{
        success: boolean;
        message: string;
    }>;
    getStatus(): {
        status: string;
        cronRunCount: number;
    };
}
