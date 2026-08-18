import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';

export class SendNotificationDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    body: string;

    @IsOptional()
    @IsObject()
    data?: Record<string, string>;
}

export class CreateReminderDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    appId: string;

    @IsString()
    @IsNotEmpty()
    appTitle: string;

    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    time: string;

    @IsString()
    @IsNotEmpty()
    endDate: string;
}

