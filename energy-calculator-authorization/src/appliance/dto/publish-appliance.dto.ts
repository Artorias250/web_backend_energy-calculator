import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PublishApplianceDto {
  @ApiProperty({ example: 'Чайник для кипячения воды' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 2200, minimum: 0, description: 'Мощность, Вт' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  powerWatts: number;

  @ApiProperty({ example: 5, description: 'Минимальная температура, °C' })
  @Type(() => Number)
  @IsInt()
  minTemperature: number;
}
