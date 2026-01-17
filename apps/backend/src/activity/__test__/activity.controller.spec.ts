import { Test, TestingModule } from '@nestjs/testing'
import { Knex } from 'knex'
import { ConfigModule } from '../../config/config.module'
import { KNEX_PROVIDER } from '../../database/knex/knex.constant'
import { KnexProvider } from '../../database/knex/knex.provider'
import { ActivityController } from '../activity.controller'
import { ActivityService } from '../activity.service'
import { PageService } from '../page.service'
import { generateFakeActivity } from './helper'

describe('activityController', () => {
  let controller: ActivityController
  let knex: Knex

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [ActivityController],
      providers: [ActivityService, PageService, KnexProvider],
    }).compile()

    controller = module.get<ActivityController>(ActivityController)
    knex = module.get<Knex>(KNEX_PROVIDER)
  })

  beforeEach(async () => {
    const activity = generateFakeActivity()

    await knex('activity').insert(activity)

    expect.getState().currentActivity = activity
    expect.getState().currentActivity = await knex('activity')
      .where('activityId', activity.activityId)
      .first()
  })

  afterEach(async () => {
    await knex('activity')
      .delete()
      .where('activityId', expect.getState().currentActivity.activityId)
  })

  afterAll(async () => {
    await knex.destroy()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  // TODO: controller testing
})
