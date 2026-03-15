import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator'

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

  @IsInt()
  @Min(0)
  @IsOptional()
  attendCount?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  mealNormal?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  mealLactoOvo?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  mealVegan?: number
}
