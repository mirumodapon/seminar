import type { Knex } from 'knex'
import { Inject, Injectable } from '@nestjs/common'
import { KNEX_PROVIDER } from '../database/knex/knex.constant'
import { CreatePageDto } from './dto/create-page.dto'
import { UpdatePageDto } from './dto/update-page.dto'

@Injectable()
export class PageService {
  constructor(@Inject(KNEX_PROVIDER) private readonly knex: Knex) { }

  findAll(activityId: string) {
    return this.knex('page')
      .where('activityId', activityId)
      .whereNull('deletedAt')
      .select('*')
  }

  findOne(activityId: string, pageId: string) {
    return this.knex('page')
      .where('activityId', activityId)
      .where('pageId', pageId)
      .whereNull('deletedAt')
      .first()
  }

  findOneIncludingDeleted(activityId: string, pageId: string) {
    return this.knex('page')
      .where('activityId', activityId)
      .where('pageId', pageId)
      .first()
  }

  async create(activityId: string, payload: CreatePageDto) {
    let order = payload.order
    if (order === undefined) {
      const result = await this.knex('page')
        .where('activityId', activityId)
        .max('order as maxOrder')
        .first()
      order = result?.maxOrder != null ? result.maxOrder + 1 : 0
    }

    await this.knex('page')
      .insert({
        ...payload,
        order,
        activityId,
      })

    return this.findOne(activityId, payload.pageId)
  }

  async restore(activityId: string, pageId: string, payload: CreatePageDto) {
    await this.knex('page')
      .where('activityId', activityId)
      .where('pageId', pageId)
      .update({
        ...payload,
        deletedAt: null,
        updatedAt: this.knex.fn.now(),
      })

    return this.findOne(activityId, pageId)
  }

  async update(activityId: string, pageId: string, payload: UpdatePageDto) {
    await this.knex('page')
      .where('activityId', activityId)
      .where('pageId', pageId)
      .update(payload)

    return this.findOne(activityId, pageId)
  }

  remove(activityId: string, pageId: string) {
    return this.knex('page')
      .where('activityId', activityId)
      .where('pageId', pageId)
      .whereNull('deletedAt')
      .update({
        deletedAt: this.knex.fn.now(),
        updatedAt: this.knex.column('updatedAt'),
      })
  }
}
