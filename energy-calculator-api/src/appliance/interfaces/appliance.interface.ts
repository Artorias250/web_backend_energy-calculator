export interface Appliance {
  applianceId: number;
  applianceName: string;
  applianceDescription: string | null;
  powerWatts: number | null;
  minTemperature: number | null;
  imageUrl: string | null;
  videoUrl: string | null;
  publicationStatus: 'draft' | 'published' | 'deleted';
  formattedAt?: Date | null;
  creatorId?: number;
  likesCount?: number;
}
