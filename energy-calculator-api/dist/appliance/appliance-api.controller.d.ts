import type { Response } from 'express';
import { ApplianceApiService } from './appliance-api.service';
import { ApplianceFilterDto } from './dto/appliance-filter.dto';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { LikeDto } from './dto/like.dto';
import { PublishApplianceDto } from './dto/publish-appliance.dto';
export declare class ApplianceApiController {
    private readonly applianceApiService;
    constructor(applianceApiService: ApplianceApiService);
    getList(filters: ApplianceFilterDto): Promise<import("./serializers/appliance.serializer").ApplianceResponse[]>;
    getFeed(): Promise<import("./serializers/appliance.serializer").ApplianceResponse>;
    getFeedById(id: number, next?: string): Promise<import("./serializers/appliance.serializer").ApplianceResponse>;
    getDraft(): Promise<import("./serializers/appliance.serializer").ApplianceResponse>;
    create(dto: CreateApplianceDto, files: {
        image?: Express.Multer.File[];
        video?: Express.Multer.File[];
    }, response: Response): Promise<import("./serializers/appliance.serializer").ApplianceResponse>;
    publish(dto: PublishApplianceDto): Promise<import("./serializers/appliance.serializer").ApplianceResponse>;
    remove(id: number): Promise<{
        message: string;
        id: number;
    }>;
    like(id: number, dto: LikeDto): Promise<{
        applianceId: number;
        value: 0 | 1;
        likesCount: number;
        isLiked: 0 | 1;
    }>;
}
