import { Module } from '@nestjs/common'
import { ActivityController } from './activity.controller'
import { ActivityService } from './activity.service'
import { ApplyScheduleController } from './apply-schedule.controller'
import { ApplyScheduleService } from './apply-schedule.service'
import { PageController } from './page.controller'
import { PageService } from './page.service'

@Module({
  controllers: [ActivityController, ApplyScheduleController, PageController],
  providers: [ActivityService, ApplyScheduleService, PageService],
  exports: [ApplyScheduleService],
})
export class ActivityModule { }
