export declare class SendNotificationDto {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}
export declare class CreateReminderDto {
    userId: string;
    appId: string;
    appTitle: string;
    token: string;
    time: string;
    endDate: string;
}
