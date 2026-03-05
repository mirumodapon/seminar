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
  author: string

  @IsString()
  @MaxLength(255)
  email: string

  @IsString()
  @MaxLength(255)
  @IsOptional()
  keywords?: string
}
