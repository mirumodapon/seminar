import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

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

  @IsBoolean()
  @IsOptional()
  vegetables?: boolean

  @IsString()
  @IsOptional()
  diningHibits?: string
}
