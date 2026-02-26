import { IsOptional, IsString } from 'class-validator'

export class CreateActivityDto {
  @IsString()
  activityId: string

  @IsString()
  name: string

  @IsOptional()
  @IsString()
  description?: string
}
