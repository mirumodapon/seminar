import { Module } from '@nestjs/common'
import { ActivityController } from './activity.controller'
import { ActivityService } from './activity.service'
import { PageController } from './page.controller'
import { PageService } from './page.service'
import { UploadController } from './upload.controller'

@Module({
  controllers: [ActivityController, PageController, UploadController],
  providers: [ActivityService, PageService],
})
export class ActivityModule { }
