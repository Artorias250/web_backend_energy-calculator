import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApplianceFilterDto {
  @ApiPropertyOptional({
    example: 100,
    minimum: 0,
    description: 'Минимальная мощность, Вт',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPower?: number;
}
