import { IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateApplyDto {
  @IsString()
  @MaxLength(50)
  activityId: string

  @IsString()
  @MaxLength(255)
  topic: string

  @IsString()
  abstract: string

  @IsString()
  @MaxLength(255)
  school: string

  @IsString()
  @MaxLength(255)
  department: string

  @IsString()
  @MaxLength(255)
  @IsOptional()
  author?: string

  @IsString()
  @MaxLength(255)
  @IsOptional()
  keywords?: string

  @IsString()
  @MaxLength(255)
  @IsOptional()
  email?: string

  @IsString()
  @MaxLength(20)
  @IsOptional()
  meal?: string

  @IsString()
  @IsOptional()
  diningHibits?: string
}
