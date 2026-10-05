import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class MinioService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private readonly client;
    private readonly bucketName;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    upload(objectName: string, file: Buffer, contentType: string): Promise<void>;
    remove(objectName: string): Promise<void>;
}
