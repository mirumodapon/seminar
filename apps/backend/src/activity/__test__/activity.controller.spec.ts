import { Test, TestingModule } from '@nestjs/testing'
import { Knex } from 'knex'
import { ConfigModule } from '../../config/config.module'
import { KNEX_PROVIDER } from '../../database/knex/knex.constant'
import { KnexProvider } from '../../database/knex/knex.provider'
import { ActivityController } from '../activity.controller'
import { ActivityService } from '../activity.service'
import { generateFakeActivity } from './helper'

describe('activityController', () => {
  let controller: ActivityController
  let knex: Knex
  const testingData: string[] = []

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [ActivityController],
      providers: [ActivityService, KnexProvider],
    }).compile()

    controller = module.get<ActivityController>(ActivityController)
    knex = module.get<Knex>(KNEX_PROVIDER)
  })

  afterAll(async () => {
    await knex('activity')
      .delete()
      .whereIn('activityId', testingData)

    await knex.destroy()
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should find activity by id', async () => {
    const fakeActivity = generateFakeActivity()
    await knex('activity')
      .insert(fakeActivity)

    const activity = await controller.findActivityById(fakeActivity.activityId)
    testingData.push(activity.activityId)

    expect(activity).toBeDefined()
    expect(activity.activityId).toBe(fakeActivity.activityId)
    expect(activity.name).toBe(fakeActivity.name)
    expect(activity.description).toBeNull()
    expect(activity.ogImage).toBeNull()
    expect(activity.active).toBeTruthy()
  })

  it('should create activity and return it', async () => {
    const fakeActivity = generateFakeActivity()

    const activity = await controller.createActivity(fakeActivity)
    testingData.push(activity.activityId)

    expect(activity).toBeDefined()
    expect(activity.activityId).toBe(fakeActivity.activityId)
    expect(activity.name).toBe(fakeActivity.name)
    expect(activity.description).toBeNull()
    expect(activity.ogImage).toBeNull()
    expect(activity.active).toBeTruthy()
  })

  it('should update activity and return it', async () => {
    const fakeActivity = generateFakeActivity()

    await knex('activity').insert(fakeActivity)
    testingData.push(fakeActivity.activityId)

    {
      const activity = await controller.updateActivity(
        fakeActivity.activityId,
        { name: 'new name' },
      )

      expect(activity).toBeDefined()
      expect(activity.activityId).toBe(fakeActivity.activityId)
      expect(activity.name).toBe('new name')
      expect(activity.description).toBeNull()
      expect(activity.ogImage).toBeNull()
      expect(activity.active).toBeTruthy()
    }
    {
      const activity = await controller.updateActivity(
        fakeActivity.activityId,
        { description: 'new description' },
      )

      expect(activity).toBeDefined()
      expect(activity.activityId).toBe(fakeActivity.activityId)
      expect(activity.name).toBe('new name')
      expect(activity.description).toBe('new description')
      expect(activity.ogImage).toBeNull()
      expect(activity.active).toBeTruthy()
    }
    {
      const activity = await controller.updateActivity(
        fakeActivity.activityId,
        {
          name: 'another name',
          ogImage: 'new ogImage',
          active: false,
        },
      )

      expect(activity).toBeDefined()
      expect(activity.activityId).toBe(fakeActivity.activityId)
      expect(activity.name).toBe('another name')
      expect(activity.description).toBe('new description')
      expect(activity.ogImage).toBe('new ogImage')
      expect(activity.active).toBeFalsy()
    }
    {
      const newId = generateFakeActivity().activityId
      const activity = await controller.updateActivity(
        fakeActivity.activityId,
        {
          activityId: newId,
          ogImage: 'another ogImage',
          active: true,
        },
      )

      expect(activity).toBeDefined()
      expect(activity.activityId).toBe(newId)
      expect(activity.name).toBe('another name')
      expect(activity.description).toBe('new description')
      expect(activity.ogImage).toBe('another ogImage')
      expect(activity.active).toBeTruthy()

      testingData.push(newId)
    }
  })

  it('should delete activity successfully', async () => {
    const fakeActivity = generateFakeActivity()

    await knex('activity').insert(fakeActivity)
    testingData.push(fakeActivity.activityId)

    await controller.deleteActivity(fakeActivity.activityId)

    const deletedActivity = await knex('activity')
      .where('activityId', fakeActivity.activityId)
      .first()

    expect(deletedActivity).toBeDefined()
    expect(deletedActivity.deletedAt).not.toBeNull()
  })
})
