import type { Knex } from 'knex'
import { Inject, Injectable } from '@nestjs/common'
import { KNEX_PROVIDER } from '../database/knex/knex.constant'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'

@Injectable()
export class ActivityService {
  constructor(@Inject(KNEX_PROVIDER) private readonly knex: Knex) { }

  async createActivity(payload: CreateActivityDto) {
    await this.knex('activity')
      .insert(payload)

    return this.findActivityById(payload.activityId)
  }

  async findActivityById(activityId: string) {
    const [activity, pages] = await Promise.all([
      this.knex('activity')
        .where('activityId', activityId)
        .first(),
      this.knex('page')
        .select('pageId', 'title')
        .where('activityId', activityId)
        .andWhere('draft', false),
    ])

    return activity && { ...activity, pages }
  }

  async updateActivity(activityId: string, payload: UpdateActivityDto) {
    await this.knex('activity')
      .update(payload)
      .where('activityId', activityId)

    return this.findActivityById(payload.activityId || activityId)
  }

  deleteActivity(activityId: string) {
    return this.knex('activity')
      .where('activityId', activityId)
      .update({
        deletedAt: this.knex.fn.now(),
        updatedAt: this.knex.column('updatedAt'),
      })
  }
}
