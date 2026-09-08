export interface Appliance {
  id: number;
  deviceName: string;
  description: string;
  fullDescription: string;
  powerWatts: number;
  category: string;
  image: string;
  video: string;
  status: 'draft' | 'published' | 'deleted';
  likes: number[];
}
