import { NotificationService } from './notification.service';
export declare class AppController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getHello(): string;
}
