import { NotificationService } from './notification.service';
import { SendNotificationDto } from './notification.dto';
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
    triggerCron(): Promise<{
        success: boolean;
        message: string;
    }>;
}
