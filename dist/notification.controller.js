"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const common_1 = require("@nestjs/common");
const notification_service_1 = require("./notification.service");
const notification_dto_1 = require("./notification.dto");
let NotificationController = class NotificationController {
    notificationService;
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    async send(sendNotificationDto) {
        return await this.notificationService.sendPushNotification(sendNotificationDto);
    }
    async createOrUpdateReminder(createReminderDto) {
        return await this.notificationService.createOrUpdateReminder(createReminderDto);
    }
    async getReminders() {
        return await this.notificationService.getReminders();
    }
    async deleteReminder(userId, appId) {
        return await this.notificationService.deleteReminder(userId, appId);
    }
    async getLogs() {
        return await this.notificationService.getNotificationLogs();
    }
    async triggerCron() {
        this.notificationService.cronHitCount++;
        await this.notificationService.checkAndSendDailyNotification1();
        return { success: true, message: 'Cron job executed successfully' };
    }
    getStatus() {
        return {
            status: 'online',
            cronRunCount: this.notificationService.cronHitCount
        };
    }
};
exports.NotificationController = NotificationController;
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.SendNotificationDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "send", null);
__decorate([
    (0, common_1.Post)('reminder'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [notification_dto_1.CreateReminderDto]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "createOrUpdateReminder", null);
__decorate([
    (0, common_1.Get)('reminders'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getReminders", null);
__decorate([
    (0, common_1.Delete)('reminder/:userId/:appId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('appId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "deleteReminder", null);
__decorate([
    (0, common_1.Get)('logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "getLogs", null);
__decorate([
    (0, common_1.Get)('cron'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationController.prototype, "triggerCron", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], NotificationController.prototype, "getStatus", null);
exports.NotificationController = NotificationController = __decorate([
    (0, common_1.Controller)('notifications'),
    __metadata("design:paramtypes", [notification_service_1.NotificationService])
], NotificationController);
//# sourceMappingURL=notification.controller.js.map