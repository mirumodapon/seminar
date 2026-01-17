import { Module } from '@nestjs/common'
import { ActivityController } from './activity.controller'
import { ActivityService } from './activity.service'
import { PageService } from './page.service'

@Module({
  controllers: [ActivityController],
  providers: [ActivityService, PageService],
})
export class ActivityModule { }
