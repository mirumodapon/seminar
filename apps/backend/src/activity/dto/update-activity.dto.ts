import { PartialType } from '@nestjs/mapped-types'
import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { CreateActivityDto } from './create-activity.dto'

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  @IsBoolean()
  @IsOptional()
  active?: boolean

  @IsString()
  @IsOptional()
  ogImage?: string

  @IsString()
  @IsOptional()
  banner?: string
}
