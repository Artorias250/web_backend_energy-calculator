import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Appliance } from './appliance.entity';
import type { Relation } from 'typeorm';

@Entity('likes')
@Unique(['userId', 'applianceId'])
export class Like {
  @PrimaryGeneratedColumn({ name: 'like_id' })
  likeId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'appliance_id' })
  applianceId: number;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne(() => Appliance, (appliance) => appliance.likes, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'appliance_id' })
  appliance: Relation<Appliance>;
}
