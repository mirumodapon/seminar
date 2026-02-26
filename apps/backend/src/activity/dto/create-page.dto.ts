import { IsString, MaxLength } from 'class-validator'

export class CreatePageDto {
  @IsString()
  @MaxLength(50)
  pageId: string

  @IsString()
  @MaxLength(50)
  title: string

  @IsString()
  @MaxLength(100)
  description: string

  @IsString()
  content: string
}
