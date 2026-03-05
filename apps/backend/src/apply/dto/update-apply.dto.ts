import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateApplyDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  topic?: string

  @IsString()
  @IsOptional()
  abstract?: string

  @IsString()
  @MaxLength(255)
  @IsOptional()
  school?: string

  @IsString()
  @MaxLength(255)
  @IsOptional()
  department?: string

  @IsString()
  @MaxLength(255)
  @IsOptional()
  author?: string

  @IsBoolean()
  @IsOptional()
  attended?: boolean

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
