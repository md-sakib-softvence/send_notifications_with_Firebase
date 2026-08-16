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
    token: string;

    @IsString()
    @IsNotEmpty()
    time: string;

    @IsOptional()
    @IsString()
    endDate?: string;

    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    appTitle?: string;

    @IsOptional()
    @IsString()
    appId?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    body?: string;
}

