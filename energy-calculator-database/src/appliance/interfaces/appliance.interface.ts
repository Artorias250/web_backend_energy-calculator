export interface Appliance {
  id: number;
  title: string;
  description: string;
  powerWatts: number;
  minTemperature: number;
  imageUrl: string;
  videoUrl: string;
  status: 'draft' | 'published' | 'deleted';
  createdAt?: Date;
  formattedAt?: Date;
  creatorId?: number;
  likesCount?: number;
}
