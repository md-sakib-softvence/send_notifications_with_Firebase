
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FirebaseService } from './firebase.service';
import { SendNotificationDto } from './notification.dto';

@Injectable()
export class NotificationService {
    public cronHitCount: number = 0;
    private readonly logger = new Logger(NotificationService.name);

    constructor(private readonly firebaseService: FirebaseService) { }

    async sendPushNotification(payload: SendNotificationDto) {
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
        } catch (error: any) {
            if (error?.codePrefix === 'messaging' || error?.code === 'messaging/registration-token-not-registered') {
                this.logger.warn(`Token not registered or invalid for Firebase push: ${token}`);
                return { success: false, error: 'invalid_token' };
            }

            this.logger.error(`Error sending push notification: ${error.message}`);
            // Return failure instead of crashing with a massive exception stack trace
            return { success: false, error: error.message };
        }
    }


    // @Cron(CronExpression.EVERY_MINUTE)
    // async checkAndSendDailyNotification() {
    //     this.cronHitCount++; // Increment the counter every time it runs!
    //     this.logger.log(`Running daily notification check... (Hit count: ${this.cronHitCount})`);
    //     try {
    //         const firestore = this.firebaseService.getFirestore();
    //         const remindersRef = firestore.collection('reminder');
    //         const snapshot = await remindersRef.get();

    //         if (snapshot.empty) {
    //             return;
    //         }

    //         const now = new Date();

    //         for (const doc of snapshot.docs) {
    //             const data = doc.data();
    //             const token = data.token;
    //             const timeData = data.time;
    //             const endDateData = data.endDate; // Get the endDate if provided

    //             if (!token || !timeData) {
    //                 continue;
    //             }

    //             // Check if the reminder has reached its 14-day limit
    //             if (endDateData) {
    //                 const expirationTime = (typeof endDateData.toDate === 'function') ? endDateData.toDate() : new Date(endDateData);

    //                 if (now >= expirationTime) {
    //                     this.logger.log(`Reminder doc ${doc.id} has reached its endDate. Deleting from database.`);
    //                     await doc.ref.delete();
    //                     continue; // Skip the rest of the loop so we don't send a notification
    //                 }
    //             }


    //             let reminderTime: Date;
    //             if (typeof timeData.toDate === 'function') {
    //                 reminderTime = timeData.toDate();
    //             } else if (typeof timeData === 'number') {

    //                 reminderTime = new Date(timeData);
    //             } else {

    //                 reminderTime = new Date(timeData);
    //             }


    //             if (now >= reminderTime) {
    //                 this.logger.log(`Reminder expired for doc ${doc.id}. Sending notification...`);

    //                 const appTitle = data.appTitle;
    //                 const appId = data.appId;

    //                 const titleStr = appTitle ? `Time to test ${appTitle}!` : (data.title || 'Daily Reminder');
    //                 const bodyStr = data.body || 'Keep your streak alive by testing today.';

    //                 const payload: SendNotificationDto = {
    //                     token: token,
    //                     title: titleStr,
    //                     body: bodyStr,
    //                     data: {
    //                         type: 'reminder',
    //                         ...(appId && { appId }),
    //                     }
    //                 };

    //                 try {
    //                     await this.sendPushNotification(payload);


    //                     await firestore.collection('notifications').add({
    //                         title: payload.title,
    //                         message: payload.body,
    //                         type: 'reminder',
    //                         isRead: false,
    //                         createdAt: new Date(),
    //                         userId: data.userId || null,
    //                         data: {
    //                             type: 'reminder',
    //                             ...(appId && { appId }),
    //                         }
    //                     });

    //                 } catch (error) {
    //                     this.logger.error(`Failed to send push for reminder ${doc.id}. It may have an invalid token.`, error);
    //                 }

    //                 const nextDay = new Date(reminderTime);
    //                 nextDay.setMinutes(nextDay.getMinutes() + 1);

    //                 await doc.ref.update({
    //                     time: nextDay.toISOString()
    //                 });

    //                 this.logger.log(`Reminder ${doc.id} updated to next minute: ${nextDay.toISOString()}`);
    //             }
    //         }
    //     } catch (error) {
    //         this.logger.error('Error in cron job while checking/sending notification:', error);
    //     }
    // }

    async checkAndSendDailyNotification1() {
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
                const endDateData = data.endDate; // Get the endDate if provided

                if (!token || !timeData) {
                    continue;
                }

                // Check if the reminder has reached its 14-day limit
                if (endDateData) {
                    const expirationTime = (typeof endDateData.toDate === 'function') ? endDateData.toDate() : new Date(endDateData);

                    if (now >= expirationTime) {
                        this.logger.log(`Reminder doc ${doc.id} has reached its endDate. Deleting from database.`);
                        await doc.ref.delete();
                        continue; // Skip the rest of the loop so we don't send a notification
                    }
                }


                let reminderTime: Date;
                if (typeof timeData.toDate === 'function') {
                    reminderTime = timeData.toDate();
                } else if (typeof timeData === 'number') {

                    reminderTime = new Date(timeData);
                } else {

                    reminderTime = new Date(timeData);
                }


                if (now >= reminderTime) {
                    this.logger.log(`Reminder expired for doc ${doc.id}. Sending notification...`);

                    const appTitle = data.appTitle;
                    const appId = data.appId;

                    const titleStr = appTitle ? `Time to test ${appTitle}!` : (data.title || 'Daily Reminder');
                    const bodyStr = data.body || 'Keep your streak alive by testing today.';

                    const payload: SendNotificationDto = {
                        token: token,
                        title: titleStr,
                        body: bodyStr,
                        data: {
                            type: 'reminder',
                            skip_firestore_save: 'true',
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
                    } catch (error) {
                        this.logger.error(`Failed to send push for reminder ${doc.id}. It may have an invalid token.`, error);
                    }

                    // Use 'now' instead of 'reminderTime' to prevent rapid retries catching up
                    const nextDay = new Date(); 
                    nextDay.setMinutes(nextDay.getMinutes() + 1);

                    await doc.ref.update({
                        time: nextDay.toISOString()
                    });

                    this.logger.log(`Reminder ${doc.id} updated to next minute: ${nextDay.toISOString()}`);
                }
            }
        } catch (error) {
            this.logger.error('Error in cron job while checking/sending notification:', error);
        }
    }
}
