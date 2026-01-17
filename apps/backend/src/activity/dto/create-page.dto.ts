import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
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
