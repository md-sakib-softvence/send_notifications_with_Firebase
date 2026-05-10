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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("./firebase.service");
let NotificationService = NotificationService_1 = class NotificationService {
    firebaseService;
    logger = new common_1.Logger(NotificationService_1.name);
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async sendPushNotification(payload) {
        const { token, title, body, data } = payload;
        try {
            const message = {
                token,
                notification: {
                    title,
                    body,
                },
                data: data || {},
            };
            const response = await this.firebaseService.getMessaging().send(message);
            this.logger.log(`Successfully sent message: ${response}`);
            return {
                success: true,
                messageId: response,
            };
        }
        catch (error) {
            if (error?.codePrefix === 'messaging' || error?.code === 'messaging/registration-token-not-registered') {
                this.logger.warn(`Token not registered or invalid for Firebase push: ${token}`);
                return { success: false, error: 'invalid_token' };
            }
            this.logger.error(`Error sending push notification: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
    async checkAndSendDailyNotification() {
        this.logger.log('Running daily notification check...');
        try {
            const firestore = this.firebaseService.getFirestore();
            const remindersRef = firestore.collection('reminder');
            const snapshot = await remindersRef.get();
            if (snapshot.empty) {
                return;
            }
            const now = new Date();
            for (const doc of snapshot.docs) {
                const data = doc.data();
                const token = data.token;
                const timeData = data.time;
                const endDateData = data.endDate;
                if (!token || !timeData) {
                    continue;
                }
                if (endDateData) {
                    const expirationTime = (typeof endDateData.toDate === 'function') ? endDateData.toDate() : new Date(endDateData);
                    if (now >= expirationTime) {
                        this.logger.log(`Reminder doc ${doc.id} has reached its endDate. Deleting from database.`);
                        await doc.ref.delete();
                        continue;
                    }
                }
                let reminderTime;
                if (typeof timeData.toDate === 'function') {
                    reminderTime = timeData.toDate();
                }
                else if (typeof timeData === 'number') {
                    reminderTime = new Date(timeData);
                }
                else {
                    reminderTime = new Date(timeData);
                }
                if (now >= reminderTime) {
                    this.logger.log(`Reminder expired for doc ${doc.id}. Sending notification...`);
                    const appTitle = data.appTitle;
                    const appId = data.appId;
                    const titleStr = appTitle ? `Time to test ${appTitle}!` : (data.title || 'Daily Reminder');
                    const bodyStr = data.body || 'Keep your streak alive by testing today.';
                    const payload = {
                        token: token,
                        title: titleStr,
                        body: bodyStr,
                        data: {
                            type: 'reminder',
                            ...(appId && { appId }),
                        }
                    };
                    try {
                        await this.sendPushNotification(payload);
                        await firestore.collection('notifications').add({
                            title: payload.title,
                            message: payload.body,
                            type: 'reminder',
                            isRead: false,
                            createdAt: new Date(),
                            userId: data.userId || null,
                            data: {
                                type: 'reminder',
                                ...(appId && { appId }),
                            }
                        });
                    }
                    catch (error) {
                        this.logger.error(`Failed to send push for reminder ${doc.id}. It may have an invalid token.`, error);
                    }
                    const nextDay = new Date(reminderTime);
                    nextDay.setMinutes(nextDay.getMinutes() + 1);
                    await doc.ref.update({
                        time: nextDay.toISOString()
                    });
                    this.logger.log(`Reminder ${doc.id} updated to next minute: ${nextDay.toISOString()}`);
                }
            }
        }
        catch (error) {
            this.logger.error('Error in cron job while checking/sending notification:', error);
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map