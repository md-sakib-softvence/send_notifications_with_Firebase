import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database.module';

import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
  ],
  controllers: [AppController, NotificationController],
  providers: [FirebaseService, NotificationService],
})
export class AppModule { }

