import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

export class AdminUpdateApplyDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  status?: string

  @IsBoolean()
  @IsOptional()
  accepted?: boolean

  @IsBoolean()
  @IsOptional()
  attended?: boolean
}
