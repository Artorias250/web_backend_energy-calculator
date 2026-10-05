import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Like } from './like.entity';

@Entity('appliances')
@Index('uq_one_draft_per_creator', ['creatorId'], {
  unique: true,
  where: "publication_status = 'draft'",
})
export class Appliance {
  @PrimaryGeneratedColumn({ name: 'appliance_id' })
  applianceId: number;

  @Column({ type: 'varchar', length: 256, name: 'appliance_name' })
  applianceName: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'appliance_description',
  })
  applianceDescription: string | null;

  @Column({
    type: 'varchar',
    length: 32,
    default: 'draft',
    name: 'publication_status',
  })
  publicationStatus: 'draft' | 'published' | 'deleted';

  @Column({ type: 'varchar', length: 512, nullable: true, name: 'image_url' })
  imageUrl: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true, name: 'video_url' })
  videoUrl: string | null;

  @Column({ type: 'int', nullable: true, name: 'power_watts' })
  powerWatts: number | null;

  @Column({ type: 'int', nullable: true, name: 'min_temperature' })
  minTemperature: number | null;

  @Column({ type: 'timestamp', nullable: true, name: 'created_at' })
  createdAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'formatted_at' })
  formattedAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'completed_at' })
  completedAt: Date | null;

  @Column({ name: 'creator_id' })
  creatorId: number;

  @Column({ type: 'int', name: 'moderator_id', nullable: true })
  moderatorId: number | null;

  @ManyToOne(() => User, (user) => user.appliances, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ManyToOne(() => User, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'moderator_id' })
  moderator: User | null;

  @OneToMany(() => Like, (like) => like.appliance)
  likes: Like[];
}
