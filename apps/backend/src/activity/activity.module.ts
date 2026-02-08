import { Module } from '@nestjs/common'
import { ActivityController } from './activity.controller'
import { ActivityService } from './activity.service'
import { PageController } from './page.controller'
import { PageService } from './page.service'

@Module({
  controllers: [ActivityController, PageController],
  providers: [ActivityService, PageService],
})
export class ActivityModule { }
