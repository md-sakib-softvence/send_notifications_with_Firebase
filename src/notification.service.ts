import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseService } from './firebase.service';
import { DatabaseService } from './database.service';
import { SendNotificationDto, CreateReminderDto } from './notification.dto';

@Injectable()
export class NotificationService {
    public cronHitCount: number = 0;
    private readonly logger = new Logger(NotificationService.name);

    constructor(
        private readonly firebaseService: FirebaseService,
        private readonly databaseService: DatabaseService
    ) { }

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
            return { success: false, error: error.message };
        }
    }

    async createOrUpdateReminder(dto: CreateReminderDto) {
        this.logger.log(`createOrUpdateReminder called for userId: ${dto.userId}, appId: ${dto.appId}`);
        try {
            const query = `
                INSERT INTO reminders ("userId", "appId", "appTitle", token, "time", "endDate")
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT ("userId", "appId")
                DO UPDATE SET token = EXCLUDED.token, "time" = EXCLUDED."time", "endDate" = EXCLUDED."endDate"
                RETURNING id
            `;
            const result = await this.databaseService.query(query, [
                dto.userId,
                dto.appId,
                dto.appTitle,
                dto.token,
                dto.time,
                dto.endDate
            ]);

            return { success: true, id: result.rows[0]?.id };
        } catch (error: any) {
            this.logger.error(`Error in createOrUpdateReminder: ${error.message}`);
            throw new InternalServerErrorException(error.message);
        }
    }

    async getReminders() {
        try {
            const res = await this.databaseService.query('SELECT * FROM reminders ORDER BY id DESC');
            return res.rows;
        } catch (error: any) {
            this.logger.error(`Error in getReminders: ${error.message}`);
            throw new InternalServerErrorException(error.message);
        }
    }

    async deleteReminder(userId: string, appId: string) {
        try {
            await this.databaseService.query('DELETE FROM reminders WHERE "userId" = $1 AND "appId" = $2', [userId, appId]);
            return { success: true, message: `Reminder for user ${userId} and app ${appId} deleted successfully` };
        } catch (error: any) {
            this.logger.error(`Error in deleteReminder: ${error.message}`);
            throw new InternalServerErrorException(error.message);
        }
    }

    async getNotificationLogs() {
        try {
            const res = await this.databaseService.query('SELECT * FROM notifications ORDER BY id DESC LIMIT 50');
            return res.rows;
        } catch (error: any) {
            this.logger.error(`Error in getNotificationLogs: ${error.message}`);
            throw new InternalServerErrorException(error.message);
        }
    }

    async checkAndSendDailyNotification1() {
        this.logger.log('Running daily notification check...');
        try {
            // 1. Delete reminders that have passed their endDate (evaluated in UTC)
            await this.databaseService.query(
                `DELETE FROM reminders WHERE "endDate" IS NOT NULL AND "endDate" <= (NOW() AT TIME ZONE 'UTC')`
            );

            // 2. Fetch ONLY reminders whose scheduled time is due/expired in UTC
            const res = await this.databaseService.query(
                `SELECT * FROM reminders WHERE time <= (NOW() AT TIME ZONE 'UTC')`
            );
            const reminders = res.rows;

            if (reminders.length === 0) {
                this.logger.log('No due reminders found.');
                return;
            }

            this.logger.log(`Found ${reminders.length} due reminder(s) to process.`);

            for (const reminder of reminders) {
                const id = reminder.id;
                const token = reminder.token;

                if (!token) {
                    continue;
                }

                this.logger.log(`Reminder expired for ID ${id}. Sending notification...`);

                const appTitle = reminder.appTitle;
                const appId = reminder.appId;

                const titleStr = appTitle ? `Time to test ${appTitle}!` : (reminder.title || 'Daily Reminder');
                const bodyStr = reminder.body || 'Keep your streak alive by testing today.';

                const payload: SendNotificationDto = {
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

                    // 1. Save to PostgreSQL notifications table
                    await this.databaseService.query(
                        `INSERT INTO notifications (title, message, type, "isRead", "createdAt", "userId", data)
                         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            payload.title,
                            payload.body,
                            'reminder',
                            false,
                            new Date(),
                            reminder.userId || null,
                            JSON.stringify({
                                type: 'reminder',
                                ...(appId && { appId }),
                            })
                        ]
                    );

                    // 2. Save to Firebase Firestore "notifications" collection
                    await this.firebaseService.getFirestore().collection('notifications').add({
                        title: payload.title,
                        message: payload.body,
                        type: 'reminder',
                        isRead: false,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        userId: reminder.userId || null,
                        appId: appId || null,
                        appTitle: appTitle || null,
                        data: {
                            type: 'reminder',
                            ...(appId && { appId }),
                        }
                    });
                    this.logger.log(`✅ Saved notification to Firestore "notifications" collection for user ${reminder.userId}`);
                } catch (error: any) {
                    this.logger.error(`Failed to send push or save notification for reminder ${id}.`, error);
                }

                // Advance the reminder's time by 2 minutes directly in UTC database time
                await this.databaseService.query(
                    `UPDATE reminders SET time = (NOW() AT TIME ZONE 'UTC') + INTERVAL '2 minutes' WHERE id = $1`,
                    [id]
                );

                this.logger.log(`Reminder ${id} updated to next 2 minutes in PostgreSQL.`);
            }
        } catch (error: any) {
            this.logger.error('Error in cron job while checking/sending notification:', error);
        }
    }
}


