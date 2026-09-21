export interface Appliance {
  id: number;
  deviceName: string;
  description: string;
  powerWatts: number;
  minTemperature: number;
  image: string;
  video: string;
  status: 'draft' | 'published' | 'deleted';
  likes: number[];
}
