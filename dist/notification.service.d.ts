import { FirebaseService } from './firebase.service';
import { DatabaseService } from './database.service';
import { SendNotificationDto, CreateReminderDto } from './notification.dto';
export declare class NotificationService {
    private readonly firebaseService;
    private readonly databaseService;
    cronHitCount: number;
    private readonly logger;
    constructor(firebaseService: FirebaseService, databaseService: DatabaseService);
    sendPushNotification(payload: SendNotificationDto): Promise<{
        success: boolean;
        messageId: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        messageId?: undefined;
    }>;
    createOrUpdateReminder(dto: CreateReminderDto): Promise<{
        success: boolean;
        id: any;
    }>;
    getReminders(): Promise<any[]>;
    deleteReminder(userId: string, appId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getNotificationLogs(): Promise<any[]>;
    checkAndSendDailyNotification1(): Promise<void>;
}
