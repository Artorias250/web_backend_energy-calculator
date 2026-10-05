import { Repository } from 'typeorm';
import { Appliance } from '../entities/appliance.entity';
import { Like } from '../entities/like.entity';
export declare class ApplianceRepository {
    private readonly appliances;
    private readonly likes;
    constructor(appliances: Repository<Appliance>, likes: Repository<Like>);
    private publishedQuery;
    findPublished(minPower?: number): Promise<Appliance[]>;
    findPublishedById(id: number): Promise<Appliance | null>;
    findNextPublished(afterId: number): Promise<Appliance | null>;
    findFirstPublished(): Promise<Appliance | null>;
    findDraft(userId: number): Promise<Appliance | null>;
    findById(id: number): Promise<Appliance | null>;
    create(data: Partial<Appliance>): Appliance;
    save(appliance: Appliance): Promise<Appliance>;
    findLike(userId: number, applianceId: number): Promise<Like | null>;
    saveLike(userId: number, applianceId: number): Promise<Like>;
    removeLike(like: Like): Promise<void>;
}
