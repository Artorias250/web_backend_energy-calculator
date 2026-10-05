import { MinioService } from '../minio/minio.service';
import { ApplianceRepository } from './appliance.repository';
import { CreateApplianceDto } from './dto/create-appliance.dto';
import { PublishApplianceDto } from './dto/publish-appliance.dto';
import { ApplianceResponse } from './serializers/appliance.serializer';
export declare class ApplianceApiService {
    private readonly appliances;
    private readonly minioService;
    constructor(appliances: ApplianceRepository, minioService: MinioService);
    getList(minPower?: number): Promise<ApplianceResponse[]>;
    getFeed(id?: number, next?: boolean): Promise<ApplianceResponse>;
    getDraft(): Promise<ApplianceResponse>;
    createWithFiles(dto: CreateApplianceDto, image: Express.Multer.File, video: Express.Multer.File): Promise<{
        created: boolean;
        appliance: ApplianceResponse;
    }>;
    publish(dto: PublishApplianceDto): Promise<ApplianceResponse>;
    softDelete(id: number): Promise<{
        message: string;
        id: number;
    }>;
    setLike(id: number, value: 0 | 1): Promise<{
        applianceId: number;
        value: 0 | 1;
        likesCount: number;
        isLiked: 0 | 1;
    }>;
    private assertMedia;
    private removeReplacedObject;
}
