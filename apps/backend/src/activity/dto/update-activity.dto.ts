import { PartialType } from '@nestjs/mapped-types'
import { IsBoolean, IsOptional } from 'class-validator'
import { CreateActivityDto } from './create-activity.dto'

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  @IsBoolean()
  @IsOptional()
  active: boolean
}

