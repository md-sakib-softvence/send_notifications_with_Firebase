import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
export declare class FirebaseService implements OnModuleInit {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    getMessaging(): admin.messaging.Messaging;
}
