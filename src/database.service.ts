import { Injectable, OnModuleInit, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(DatabaseService.name);
    private pool: Pool;

    constructor() {
        this.pool = new Pool({
            connectionString: 'postgresql://neondb_owner:npg_AeQ3xy7wpIlk@ep-morning-frost-ay450a7j-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
        });
    }

    async onModuleInit() {
        try {
            await this.pool.query('SELECT NOW()');
            this.logger.log('✅ Successfully connected to NeonDB (PostgreSQL)');
            await this.initializeTables();
        } catch (error) {
            this.logger.error('❌ Failed to connect to NeonDB', error);
        }
    }

    async onModuleDestroy() {
        await this.pool.end();
        this.logger.log('Pool closed.');
    }

    private async initializeTables() {
        const createRemindersTable = `
            CREATE TABLE IF NOT EXISTS reminders (
                id SERIAL PRIMARY KEY,
                token VARCHAR(500) NOT NULL,
                time TIMESTAMP NOT NULL,
                "endDate" TIMESTAMP,
                "userId" VARCHAR(255),
                "appTitle" VARCHAR(255),
                "appId" VARCHAR(255),
                title VARCHAR(255),
                body TEXT
            );
        `;

        const createNotificationsTable = `
            CREATE TABLE IF NOT EXISTS notifications (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) NOT NULL,
                "isRead" BOOLEAN DEFAULT FALSE,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "userId" VARCHAR(255),
                data JSONB
            );
        `;

        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        try {
            await this.pool.query(createRemindersTable);
            await this.pool.query(`
                CREATE UNIQUE INDEX IF NOT EXISTS reminders_user_app_idx 
                ON reminders ("userId", "appId");
            `);
            await this.pool.query(createNotificationsTable);
            await this.pool.query(createUsersTable);
            this.logger.log('✅ PostgreSQL tables checked/created successfully');
        } catch (error) {
            this.logger.error('❌ Failed to initialize database tables', error);
        }
    }

    async query(text: string, params?: any[]) {
        return this.pool.query(text, params);
    }
}
