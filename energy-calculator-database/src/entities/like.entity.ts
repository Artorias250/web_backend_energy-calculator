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
  user: User;

  @ManyToOne(() => Appliance, (appliance) => appliance.likes, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'appliance_id' })
  appliance: Appliance;
}
