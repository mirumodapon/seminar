import { Module } from '@nestjs/common'
import { ActivityModule } from '../activity/activity.module'
import { ApplyScheduleGuard } from './apply-schedule.guard'
import { ApplyController } from './apply.controller'
import { ApplyService } from './apply.service'

@Module({
  imports: [ActivityModule],
  controllers: [ApplyController],
  providers: [ApplyService, ApplyScheduleGuard],
})
export class ApplyModule { }
