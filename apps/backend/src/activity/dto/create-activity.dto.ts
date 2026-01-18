import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateActivityDto {
  @IsString()
  @MaxLength(50)
  activityId: string

  @IsString()
  @MaxLength(255)
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsBoolean()
  @IsOptional()
  active?: boolean
}
