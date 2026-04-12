import type { Knex } from 'knex'
import type { RedisClientType } from 'redis'
import type { ActivityApplySchedule, ApplyScheduleAction, ApplyScheduleDateField } from './apply-schedule.types'
import { ForbiddenException, Inject, Injectable } from '@nestjs/common'
import { KNEX_PROVIDER } from '../database/knex/knex.constant'
import { REDIS_PROVIDER } from '../database/redis/redis.constant'
import {
  applyScheduleActionFieldMap,
  applyScheduleActionLabelMap,
  applyScheduleDateFields,
} from './apply-schedule.types'
import { UpdateActivityApplyScheduleDto } from './dto/update-activity-apply-schedule.dto'

interface ActivityApplyScheduleRow {
  activityId: string
  applyCreateDeadlineAt: string | null
  applyEditDeadlineAt: string | null
  slidesUploadDeadlineAt: string | null
  posterUploadDeadlineAt: string | null
}

const APPLY_SCHEDULE_CACHE_TTL_SECONDS = 300

@Injectable()
export class ApplyScheduleService {
  constructor(
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
    @Inject(REDIS_PROVIDER) private readonly redis: RedisClientType,
  ) { }

  async findByActivityId(activityId: string): Promise<ActivityApplySchedule> {
    const cacheKey = this.getCacheKey(activityId)
    const cachedSchedule = await this.redis.get(cacheKey)

    if (cachedSchedule) {
      return JSON.parse(cachedSchedule) as ActivityApplySchedule
    }

    const row = await this.knex<ActivityApplyScheduleRow>('activityApplySchedule')
      .where('activityId', activityId)
      .first()

    const schedule = row ? this.mapRow(row) : this.createEmptySchedule(activityId)

    await this.redis.setEx(cacheKey, APPLY_SCHEDULE_CACHE_TTL_SECONDS, JSON.stringify(schedule))

    return schedule
  }

  async upsert(activityId: string, payload: UpdateActivityApplyScheduleDto): Promise<ActivityApplySchedule> {
    const databasePayload = this.buildDatabasePayload(payload)
    const existingSchedule = await this.knex('activityApplySchedule')
      .where('activityId', activityId)
      .first()

    if (existingSchedule) {
      if (Object.keys(databasePayload).length > 0) {
        await this.knex('activityApplySchedule')
          .where('activityId', activityId)
          .update(databasePayload)
      }
    }
    else {
      await this.knex('activityApplySchedule')
        .insert({
          activityId,
          ...databasePayload,
        })
    }

    await this.redis.del(this.getCacheKey(activityId))

    return this.findByActivityId(activityId)
  }

  async assertActionAllowed(activityId: string, action: ApplyScheduleAction): Promise<void> {
    const schedule = await this.findByActivityId(activityId)
    const deadlineField = applyScheduleActionFieldMap[action]
    const deadline = schedule[deadlineField]
    const actionLabel = applyScheduleActionLabelMap[action]

    if (!deadline) {
      throw new ForbiddenException(`${actionLabel}目前未開放`)
    }

    if (Date.now() >= new Date(deadline).getTime()) {
      throw new ForbiddenException(`${actionLabel}已截止`)
    }
  }

  private createEmptySchedule(activityId: string): ActivityApplySchedule {
    return {
      activityId,
      applyCreateDeadlineAt: null,
      applyEditDeadlineAt: null,
      slidesUploadDeadlineAt: null,
      posterUploadDeadlineAt: null,
    }
  }

  private mapRow(row: ActivityApplyScheduleRow): ActivityApplySchedule {
    return {
      activityId: row.activityId,
      applyCreateDeadlineAt: this.toIsoTimestamp(row.applyCreateDeadlineAt),
      applyEditDeadlineAt: this.toIsoTimestamp(row.applyEditDeadlineAt),
      slidesUploadDeadlineAt: this.toIsoTimestamp(row.slidesUploadDeadlineAt),
      posterUploadDeadlineAt: this.toIsoTimestamp(row.posterUploadDeadlineAt),
    }
  }

  private buildDatabasePayload(payload: UpdateActivityApplyScheduleDto): Partial<Record<ApplyScheduleDateField, string | null>> {
    return applyScheduleDateFields.reduce<Partial<Record<ApplyScheduleDateField, string | null>>>((result, field) => {
      const value = payload[field]

      if (value === undefined) {
        return result
      }

      result[field] = value === null ? null : this.toDatabaseTimestamp(value)
      return result
    }, {})
  }

  private toDatabaseTimestamp(value: string): string {
    const date = new Date(value)
    const formattedDate = [
      date.getUTCFullYear(),
      this.padTime(date.getUTCMonth() + 1),
      this.padTime(date.getUTCDate()),
    ].join('-')

    return `${formattedDate} ${this.padTime(date.getUTCHours())}:${this.padTime(date.getUTCMinutes())}:${this.padTime(date.getUTCSeconds())}`
  }

  private toIsoTimestamp(value: string | null): string | null {
    if (!value) {
      return null
    }

    return `${value.replace(' ', 'T')}Z`
  }

  private padTime(value: number): string {
    return String(value).padStart(2, '0')
  }

  private getCacheKey(activityId: string): string {
    return `activity:apply-schedule:${activityId}`
  }
}
