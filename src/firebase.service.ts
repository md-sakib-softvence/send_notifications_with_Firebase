import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
    private readonly logger = new Logger(FirebaseService.name);

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        if (!admin.apps.length) {
            try {
                const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
                const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
                const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

                if (!projectId || !clientEmail || !privateKey) {
                    this.logger.error('Firebase configuration is missing in .env');
                    return;
                }

                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId,
                        clientEmail,
                        privateKey,
                    }),
                });

                this.logger.log('✅ Firebase Admin SDK initialized successfully');
            } catch (error) {
                this.logger.error('❌ Failed to initialize Firebase Admin SDK', error);
            }
        }
    }

    getMessaging(): admin.messaging.Messaging {
        return admin.messaging();
    }
}
