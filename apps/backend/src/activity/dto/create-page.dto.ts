import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreatePageDto {
  @IsString()
  @MaxLength(50)
  pageId: string

  @IsString()
  @IsOptional()
  content?: string

  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @MaxLength(255)
  @IsOptional()
  author?: string

  @IsBoolean()
  @IsOptional()
  draft?: boolean
}
