import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateApplianceDto {
  @ApiProperty({ example: 'Новый чайник', maxLength: 256 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(256)
  applianceName: string;
}
