import type { Knex } from 'knex'
import { Inject, Injectable } from '@nestjs/common'
import { KNEX_PROVIDER } from '../database/knex/knex.constant'
import { CreatePageDto } from './dto/create-page.dto'
import { UpdatePageDto } from './dto/update-page.dto'

@Injectable()
export class PageService {
  constructor(@Inject(KNEX_PROVIDER) private readonly knex: Knex) { }

  async createPage(activityId: string, payload: CreatePageDto) {
    await this.knex('page')
      .insert({ activityId, ...payload })

    return this.findPageById(activityId, payload.pageId)
  }

  findPageById(activityId: string, pageId: string) {
    return this.knex('page')
      .select('page.*')
      .leftJoin('activity', 'activity.activityId', 'page.activityId')
      .where('page.activityId', activityId)
      .andWhere('pageId', pageId)
      .whereNull('page.deletedAt')
      .whereNull('activity.deletedAt')
      .first()
  }

  async updatePage(activityId: string, pageId: string, payload: UpdatePageDto) {
    await this.knex('page')
      .update(payload)
      .where('activityId', activityId)
      .andWhere('pageId', pageId)

    return this.findPageById(activityId, payload.pageId || pageId)
  }

  deletePage(activityId: string, pageId: string) {
    return this.knex('page')
      .where('activityId', activityId)
      .andWhere('pageId', pageId)
      .update({
        deletedAt: this.knex.fn.now(),
        updatedAt: this.knex.fn.now(),
      })
  }

  async recoverPage(activityId: string, pageId: string) {
    await this.knex('page')
      .where('activityId', activityId)
      .andWhere('pageId', pageId)
      .update({
        deletedAt: null,
        updatedAt: this.knex.fn.now(),
      })

    return this.findPageById(activityId, pageId)
  }
}
