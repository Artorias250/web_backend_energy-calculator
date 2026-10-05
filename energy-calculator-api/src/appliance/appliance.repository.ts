import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appliance } from '../entities/appliance.entity';
import { Like } from '../entities/like.entity';

@Injectable()
export class ApplianceRepository {
  constructor(
    @InjectRepository(Appliance)
    private readonly appliances: Repository<Appliance>,
    @InjectRepository(Like)
    private readonly likes: Repository<Like>,
  ) {}

  private publishedQuery() {
    return this.appliances
      .createQueryBuilder('appliance')
      .leftJoinAndSelect('appliance.likes', 'likes')
      .where('appliance.publicationStatus = :status', { status: 'published' });
  }

  findPublished(minPower?: number): Promise<Appliance[]> {
    const query = this.publishedQuery().orderBy('appliance.applianceId', 'ASC');
    if (minPower !== undefined && !Number.isNaN(minPower) && minPower > 0) {
      query.andWhere('appliance.powerWatts >= :minPower', { minPower });
    }
    return query.getMany();
  }

  findPublishedById(id: number): Promise<Appliance | null> {
    return this.publishedQuery()
      .andWhere('appliance.applianceId = :id', { id })
      .getOne();
  }

  async findNextPublished(afterId: number): Promise<Appliance | null> {
    const next = await this.publishedQuery()
      .andWhere('appliance.applianceId > :id', { id: afterId })
      .orderBy('appliance.applianceId', 'ASC')
      .getOne();
    if (next) {
      return next;
    }
    return this.publishedQuery()
      .orderBy('appliance.applianceId', 'ASC')
      .getOne();
  }

  findFirstPublished(): Promise<Appliance | null> {
    return this.publishedQuery()
      .orderBy('appliance.applianceId', 'ASC')
      .getOne();
  }

  findDraft(userId: number): Promise<Appliance | null> {
    return this.appliances.findOne({
      where: { creatorId: userId, publicationStatus: 'draft' },
      relations: { likes: true },
    });
  }

  findById(id: number): Promise<Appliance | null> {
    return this.appliances.findOne({
      where: { applianceId: id },
      relations: { likes: true },
    });
  }

  create(data: Partial<Appliance>): Appliance {
    return this.appliances.create(data);
  }

  save(appliance: Appliance): Promise<Appliance> {
    return this.appliances.save(appliance);
  }

  findLike(userId: number, applianceId: number): Promise<Like | null> {
    return this.likes.findOne({ where: { userId, applianceId } });
  }

  saveLike(userId: number, applianceId: number): Promise<Like> {
    return this.likes.save(this.likes.create({ userId, applianceId }));
  }

  async removeLike(like: Like): Promise<void> {
    await this.likes.remove(like);
  }
}
