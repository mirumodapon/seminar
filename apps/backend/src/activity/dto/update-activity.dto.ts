import { PartialType } from '@nestjs/mapped-types'
import { IsOptional, IsString } from 'class-validator'
import { CreateActivityDto } from './create-activity.dto'

export class UpdateActivityDto extends PartialType(CreateActivityDto) {
  @IsString()
  @IsOptional()
  banner?: string

  @IsString()
  @IsOptional()
  ogImage?: string

  @IsString()
  @IsOptional()
  logo?: string
}
