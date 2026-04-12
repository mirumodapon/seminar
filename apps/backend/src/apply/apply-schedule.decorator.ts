import type { ApplyScheduleAction } from '../activity/apply-schedule.types'
import { SetMetadata } from '@nestjs/common'

export const APPLY_SCHEDULE_ACTION = 'apply-schedule-action'

export const ApplySchedule = (action: ApplyScheduleAction) => SetMetadata(APPLY_SCHEDULE_ACTION, action)
