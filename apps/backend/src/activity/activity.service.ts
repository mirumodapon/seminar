import type { Knex } from 'knex'
import { Inject, Injectable } from '@nestjs/common'
import { KNEX_PROVIDER } from '../database/knex/knex.constant'
import { CreateActivityDto } from './dto/create-activity.dto'
import { UpdateActivityDto } from './dto/update-activity.dto'

@Injectable()
export class ActivityService {
  constructor(@Inject(KNEX_PROVIDER) private readonly knex: Knex) { }

  findAll() {
    return this.knex('activity')
      .whereNull('deletedAt')
      .select('*')
  }

  async findOne(id: string) {
    const [activity, pages] = await Promise.all([

      this.knex('activity')
        .where('activityId', id)
        .whereNull('deletedAt')
        .first(),
      this.knex('page')
        .select(['pageId', 'title'])
        .where('activityId', id)
        .whereNull('deletedAt'),
    ])

    return {
      ...activity,
      pages,
    }
  }

  async create(payload: CreateActivityDto) {
    await this.knex('activity')
      .insert(payload)

    return this.findOne(payload.activityId)
  }

  async update(id: string, payload: UpdateActivityDto) {
    await this.knex('activity')
      .where('activityId', id)
      .update(payload)

    return this.findOne(id)
  }

  remove(id: string) {
    return this.knex('activity')
      .where('activityId', id)
      .whereNull('deletedAt')
      .update({
        deletedAt: this.knex.fn.now(),
        updatedAt: this.knex.column('updatedAt'),
      })
  }

  async recover(id: string) {
    await this.knex('activity')
      .where('activityId', id)
      .whereNotNull('deletedAt')
      .update({ deletedAt: null })

    return this.findOne(id)
  }
}
