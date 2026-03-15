import type { Knex } from 'knex'
import { Inject, Injectable } from '@nestjs/common'
import { KNEX_PROVIDER } from '../database/knex/knex.constant'
import { AdminUpdateApplyDto } from './dto/admin-update-apply.dto'
import { CreateApplyDto } from './dto/create-apply.dto'
import { UpdateApplyDto } from './dto/update-apply.dto'

@Injectable()
export class ApplyService {
  constructor(@Inject(KNEX_PROVIDER) private readonly knex: Knex) { }

  findAll() {
    return this.knex('apply').select('*')
  }

  findOne(applyId: number) {
    return this.knex('apply').where('applyId', applyId).first()
  }

  findByUser(userId: number) {
    return this.knex('apply').where('userId', userId).select('*')
  }

  async create(userId: number, payload: CreateApplyDto) {
    const [applyId] = await this.knex('apply').insert({ ...payload, userId })
    return this.findOne(applyId)
  }

  async update(applyId: number, payload: UpdateApplyDto) {
    await this.knex('apply').where('applyId', applyId).update(payload)
    return this.findOne(applyId)
  }

  async adminUpdate(applyId: number, payload: AdminUpdateApplyDto) {
    await this.knex('apply').where('applyId', applyId).update(payload)
    return this.findOne(applyId)
  }

  async updateFile(applyId: number, field: 'slides' | 'poster', filename: string) {
    await this.knex('apply').where('applyId', applyId).update({ [field]: filename })
    return this.findOne(applyId)
  }

  async getStatistics(activityId?: string) {
    const query = this.knex('apply').where('status', 'accepted')

    if (activityId) {
      query.where('activityId', activityId)
    }

    const applies = await query.select('*')

    const totalAccepted = applies.length

    const isAppended = applies.filter(app => app.attended === 1)

    const totalAttendees = isAppended.reduce((sum, app) => app.attended === 1 ? sum + (app.attendCount || 0) : sum, 0)
    const totalNormal = isAppended.reduce((sum, app) => sum + (app.mealNormal || 0), 0)
    const totalLactoOvo = isAppended.reduce((sum, app) => sum + (app.mealLactoOvo || 0), 0)
    const totalVegan = isAppended.reduce((sum, app) => sum + (app.mealVegan || 0), 0)

    return {
      totalAccepted,
      totalAttendees,
      totalNormal,
      totalLactoOvo,
      totalVegan,
      applies,
    }
  }
}
