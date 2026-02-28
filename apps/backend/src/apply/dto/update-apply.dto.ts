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

  @IsBoolean()
  @IsOptional()
  vegetables?: boolean

  @IsString()
  @IsOptional()
  diningHibits?: string
}
