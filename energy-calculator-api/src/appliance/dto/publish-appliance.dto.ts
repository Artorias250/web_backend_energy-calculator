import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class PublishApplianceDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  powerWatts: number;

  @Type(() => Number)
  @IsInt()
  minTemperature: number;
}
