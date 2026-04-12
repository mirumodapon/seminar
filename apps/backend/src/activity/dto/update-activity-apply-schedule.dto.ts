import { IsDateString, IsOptional } from 'class-validator'

export class UpdateActivityApplyScheduleDto {
  @IsDateString()
  @IsOptional()
  applyCreateDeadlineAt?: string | null

  @IsDateString()
  @IsOptional()
  applyEditDeadlineAt?: string | null

  @IsDateString()
  @IsOptional()
  slidesUploadDeadlineAt?: string | null

  @IsDateString()
  @IsOptional()
  posterUploadDeadlineAt?: string | null
}
