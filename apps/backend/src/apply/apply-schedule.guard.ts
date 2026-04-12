import type { Request } from 'express'
import type { ApplyScheduleAction } from '../activity/apply-schedule.types'
import { BadRequestException, CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ApplyScheduleService } from '../activity/apply-schedule.service'
import { APPLY_SCHEDULE_ACTION } from './apply-schedule.decorator'
import { ApplyService } from './apply.service'

@Injectable()
export class ApplyScheduleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly applyService: ApplyService,
    private readonly applyScheduleService: ApplyScheduleService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.getAllAndOverride<ApplyScheduleAction>(APPLY_SCHEDULE_ACTION, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!action) {
      return true
    }

    const request = context.switchToHttp().getRequest<Request & {
      body?: { activityId?: string }
      params?: { applyId?: string }
    }>()

    const activityId = action === 'create'
      ? this.getActivityIdFromBody(request)
      : await this.getActivityIdFromApplyId(request.params?.applyId)

    await this.applyScheduleService.assertActionAllowed(activityId, action)

    return true
  }

  private getActivityIdFromBody(request: Request & { body?: { activityId?: string } }): string {
    const activityId = request.body?.activityId?.trim()

    if (!activityId) {
      throw new BadRequestException('activityId 為必填')
    }

    return activityId
  }

  private async getActivityIdFromApplyId(rawApplyId?: string): Promise<string> {
    const applyId = Number(rawApplyId)

    if (!Number.isInteger(applyId)) {
      throw new BadRequestException('applyId 格式錯誤')
    }

    const apply = await this.applyService.findOne(applyId)

    if (!apply) {
      throw new NotFoundException('找不到此投稿')
    }

    return apply.activityId
  }
}
