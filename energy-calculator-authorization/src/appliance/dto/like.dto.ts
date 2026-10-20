import { Type } from 'class-transformer';
import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LikeDto {
  @ApiProperty({ example: 1, enum: [0, 1] })
  @Type(() => Number)
  @IsIn([0, 1])
  value: 0 | 1;
}
