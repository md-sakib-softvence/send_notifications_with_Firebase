import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
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
        this.logger.log(`createOrUpdateReminder called for token: ${dto.token}`);
        try {
            let existingReminder: any = null;

            // Search by userId and appId if both exist
            if (dto.userId && dto.appId) {
                const res = await this.databaseService.query(
                    `SELECT * FROM reminders WHERE "userId" = $1 AND "appId" = $2 LIMIT 1`,
                    [dto.userId, dto.appId]
                );
                if (res.rows.length > 0) {
                    existingReminder = res.rows[0];
                }
            } 
            
            // Otherwise, search by token and appId if both exist
            if (!existingReminder && dto.token && dto.appId) {
                const res = await this.databaseService.query(
                    `SELECT * FROM reminders WHERE token = $1 AND "appId" = $2 LIMIT 1`,
                    [dto.token, dto.appId]
                );
                if (res.rows.length > 0) {
                    existingReminder = res.rows[0];
                }
            }

            // Otherwise, fallback to matching by token only
            if (!existingReminder && dto.token) {
                const res = await this.databaseService.query(
                    `SELECT * FROM reminders WHERE token = $1 LIMIT 1`,
                    [dto.token]
                );
                if (res.rows.length > 0) {
                    existingReminder = res.rows[0];
                }
            }

            if (existingReminder) {
                this.logger.log(`Found existing reminder with ID: ${existingReminder.id}. Modifying it.`);
                await this.databaseService.query(
                    `UPDATE reminders 
                     SET time = $1, "endDate" = $2, "userId" = $3, "appTitle" = $4, "appId" = $5, title = $6, body = $7, token = $8
                     WHERE id = $9`,
                    [
                        dto.time,
                        dto.endDate || existingReminder.endDate,
                        dto.userId || existingReminder.userId,
                        dto.appTitle || existingReminder.appTitle,
                        dto.appId || existingReminder.appId,
                        dto.title || existingReminder.title,
                        dto.body || existingReminder.body,
                        dto.token,
                        existingReminder.id
                    ]
                );
                return { success: true, action: 'updated', id: existingReminder.id };
            } else {
                this.logger.log(`No existing reminder found. Inserting a new reminder.`);
                const insertRes = await this.databaseService.query(
                    `INSERT INTO reminders (token, time, "endDate", "userId", "appTitle", "appId", title, body)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
                    [
                        dto.token,
                        dto.time,
                        dto.endDate || null,
                        dto.userId || null,
                        dto.appTitle || null,
                        dto.appId || null,
                        dto.title || null,
                        dto.body || null
                    ]
                );
                const newId = insertRes.rows[0].id;
                return { success: true, action: 'created', id: newId };
            }
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

    async deleteReminder(id: number) {
        try {
            await this.databaseService.query('DELETE FROM reminders WHERE id = $1', [id]);
            return { success: true, message: `Reminder ${id} deleted successfully` };
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
            const res = await this.databaseService.query('SELECT * FROM reminders');
            const reminders = res.rows;

            if (reminders.length === 0) {
                return;
            }

            const now = new Date();

            for (const reminder of reminders) {
                const id = reminder.id;
                const token = reminder.token;
                const timeData = reminder.time;
                const endDateData = reminder.endDate;

                if (!token || !timeData) {
                    continue;
                }

                // Check if the reminder has reached its endDate limit
                if (endDateData) {
                    const expirationTime = new Date(endDateData);

                    if (now >= expirationTime) {
                        this.logger.log(`Reminder ID ${id} has reached its endDate. Deleting from database.`);
                        await this.databaseService.query('DELETE FROM reminders WHERE id = $1', [id]);
                        continue;
                    }
                }

                const reminderTime = new Date(timeData);

                if (now >= reminderTime) {
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
                            skip_firestore_save: 'true',
                            ...(appId && { appId }),
                        }
                    };

                    try {
                        await this.sendPushNotification(payload);

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
                    } catch (error: any) {
                        this.logger.error(`Failed to send push for reminder ${id}. It may have an invalid token.`, error);
                    }

                    // Use 'now' instead of 'reminderTime' to prevent rapid retries catching up
                    const nextDay = new Date(); 
                    nextDay.setDate(nextDay.getDate() + 1);

                    await this.databaseService.query(
                        `UPDATE reminders SET time = $1 WHERE id = $2`,
                        [nextDay.toISOString(), id]
                    );

                    this.logger.log(`Reminder ${id} updated to next day: ${nextDay.toISOString()}`);
                }
            }
        } catch (error: any) {
            this.logger.error('Error in cron job while checking/sending notification:', error);
        }
    }
}

