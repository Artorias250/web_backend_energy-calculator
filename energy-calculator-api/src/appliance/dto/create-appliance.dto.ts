import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class CreateApplianceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  applianceName: string;

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
