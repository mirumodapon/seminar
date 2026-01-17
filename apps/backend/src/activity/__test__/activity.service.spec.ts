import type { Knex } from 'knex'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '../../config/config.module'
import { KNEX_PROVIDER } from '../../database/knex/knex.constant'
import { KnexProvider } from '../../database/knex/knex.provider'
import { ActivityService } from '../activity.service'
import { CreateActivityDto } from '../dto/create-activity.dto'
import { PageService } from '../page.service'
import { generateFakeActivity } from './helper'

describe('activityService', () => {
  let service: ActivityService
  let knex: Knex

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [KnexProvider, PageService, ActivityService],
    }).compile()

    service = module.get<ActivityService>(ActivityService)
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
    expect(service).toBeDefined()
  })

  it('should create activity and return it', async () => {
    const activity = generateFakeActivity()

    const createdActivity = await service.createActivity(activity)

    expect(createdActivity).toBeDefined()
    expect(createdActivity.activityId).toBe(activity.activityId)
    expect(createdActivity.name).toBe(activity.name)
    expect(createdActivity.ogImage).toBe(activity.ogImage)
    expect(createdActivity.description).toBe(activity.description)
    expect(createdActivity.active).toBeTruthy()
    expect(createdActivity.createdAt).toBeDefined()
    expect(createdActivity.updatedAt).toBeDefined()
    expect(createdActivity.deletedAt).toBeNull()

    await knex('activity').delete().where('activityId', activity.activityId)
  })

  it('should find activity by id', async () => {
    const existingActivity = expect.getState().currentActivity
    const activity = await service.findActivityById(existingActivity.activityId)

    expect(activity).toBeDefined()
    expect(activity.activityId).toBe(existingActivity.activityId)
    expect(activity.name).toBe(existingActivity.name)
    expect(activity.ogImage).toBe(existingActivity.ogImage)
    expect(activity.description).toBe(existingActivity.description)
    expect(activity.active).toBeTruthy()
    expect(activity.createdAt).toBeDefined()
    expect(activity.updatedAt).toBeDefined()
    expect(activity.deletedAt).toBeNull()
  })

  it('should update activity and return it', async () => {
    const existingActivity = expect.getState().currentActivity
    const activity: Partial<CreateActivityDto> = generateFakeActivity()

    activity.active = false
    delete activity.activityId

    const updatedActivity = await service.updateActivity(existingActivity.activityId, activity)

    expect(updatedActivity).toBeDefined()
    expect(updatedActivity.activityId).toBe(existingActivity.activityId)
    expect(updatedActivity.name).toBe(activity.name)
    expect(updatedActivity.ogImage).toBe(activity.ogImage)
    expect(updatedActivity.description).toBe(activity.description)
    expect(updatedActivity.active).toBeFalsy()
    expect(updatedActivity.createdAt).toBeDefined()
    expect(updatedActivity.updatedAt).toBeDefined()
    expect(updatedActivity.deletedAt).toBeNull()
  })

  it('should delete activity', async () => {
    const existingActivity = expect.getState().currentActivity

    await service.deleteActivity(existingActivity.activityId)

    const deletedActivity = await service.findActivityById(existingActivity.activityId)

    expect(deletedActivity).toBeDefined()
    expect(deletedActivity.activityId).toBe(existingActivity.activityId)
    expect(deletedActivity.name).toBe(existingActivity.name)
    expect(deletedActivity.ogImage).toBe(existingActivity.ogImage)
    expect(deletedActivity.description).toBe(existingActivity.description)
    expect(deletedActivity.active).toBeTruthy()
    expect(deletedActivity.createdAt).toBeDefined()
    expect(deletedActivity.updatedAt).toBeDefined()
    expect(deletedActivity.deletedAt).not.toBeNull()
  })
})
