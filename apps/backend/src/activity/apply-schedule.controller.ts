import { Body, Controller, Get, NotFoundException, Param, Patch, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../auth/guard'
import { ActivityService } from './activity.service'
import { ApplyScheduleService } from './apply-schedule.service'
import { UpdateActivityApplyScheduleDto } from './dto/update-activity-apply-schedule.dto'

@Controller('activity/:activityId/apply-schedule')
export class ApplyScheduleController {
  constructor(
    private readonly activityService: ActivityService,
    private readonly applyScheduleService: ApplyScheduleService,
  ) { }

  @Get()
  async findOne(@Param('activityId') activityId: string) {
    await this.ensureActivityExists(activityId)

    return this.applyScheduleService.findByActivityId(activityId)
  }

  @Patch()
  @UseGuards(AdminGuard)
  async update(
    @Param('activityId') activityId: string,
    @Body() body: UpdateActivityApplyScheduleDto,
  ) {
    await this.ensureActivityExists(activityId)

    return this.applyScheduleService.upsert(activityId, body)
  }

  private async ensureActivityExists(activityId: string): Promise<void> {
    const activity = await this.activityService.findOne(activityId)

    if (!activity?.activityId) {
      throw new NotFoundException('找不到這個活動 RR')
    }
  }
}
