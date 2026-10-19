import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateApplianceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  applianceName: string;
}
