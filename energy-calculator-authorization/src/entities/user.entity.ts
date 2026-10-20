import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Appliance } from './appliance.entity';
import { Like } from './like.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 128, name: 'user_name', unique: true })
  userName: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 64 })
  password: string;

  @OneToMany(() => Appliance, (appliance) => appliance.creator)
  appliances: Appliance[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];
}
