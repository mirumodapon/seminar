export interface ActivityApplySchedule {
  activityId: string
  applyCreateDeadlineAt: string | null
  applyEditDeadlineAt: string | null
  slidesUploadDeadlineAt: string | null
  posterUploadDeadlineAt: string | null
}

export type ApplyScheduleAction = 'create' | 'edit' | 'slidesUpload' | 'posterUpload'

export const applyScheduleDateFields = [
  'applyCreateDeadlineAt',
  'applyEditDeadlineAt',
  'slidesUploadDeadlineAt',
  'posterUploadDeadlineAt',
] as const

export type ApplyScheduleDateField = (typeof applyScheduleDateFields)[number]

export const applyScheduleActionFieldMap: Record<ApplyScheduleAction, ApplyScheduleDateField> = {
  create: 'applyCreateDeadlineAt',
  edit: 'applyEditDeadlineAt',
  slidesUpload: 'slidesUploadDeadlineAt',
  posterUpload: 'posterUploadDeadlineAt',
}

export const applyScheduleActionLabelMap: Record<ApplyScheduleAction, string> = {
  create: '投稿',
  edit: '投稿編輯',
  slidesUpload: 'slides 上傳',
  posterUpload: 'poster 上傳',
}
