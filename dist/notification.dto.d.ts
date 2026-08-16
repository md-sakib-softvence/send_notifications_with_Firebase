export declare class SendNotificationDto {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}
export declare class CreateReminderDto {
    token: string;
    time: string;
    endDate?: string;
    userId?: string;
    appTitle?: string;
    appId?: string;
    title?: string;
    body?: string;
}
