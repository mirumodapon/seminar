import type { Knex } from 'knex'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '../../config/config.module'
import { KNEX_PROVIDER } from '../../database/knex/knex.constant'
import { KnexProvider } from '../../database/knex/knex.provider'
import { ActivityService } from '../activity.service'
import { generateFakeActivity } from './helper'

describe('activityService', () => {
  let service: ActivityService
  let knex: Knex
  const testingData: string[] = []

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [KnexProvider, ActivityService],
    }).compile()

    service = module.get<ActivityService>(ActivityService)
    knex = module.get<Knex>(KNEX_PROVIDER)
  })

  afterAll(async () => {
    await knex('activity')
      .delete()
      .whereIn('activityId', testingData)

    await knex.destroy()
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should find activity by id', async () => {
    const fakeActivity = generateFakeActivity()

    await knex('activity').insert(fakeActivity)
    testingData.push(fakeActivity.activityId)

    const foundActivity = await service.findActivityById(fakeActivity.activityId)

    expect(foundActivity).toBeDefined()
    expect(foundActivity.activityId).toBe(fakeActivity.activityId)
    expect(foundActivity.name).toBe(fakeActivity.name)
    expect(foundActivity.description).toBeNull()
    expect(foundActivity.ogImage).toBeNull()
    expect(foundActivity.active).toBeTruthy()
  })

  it('should create activity and return it', async () => {
    {
      const fakeActivity = generateFakeActivity()

      const activity = await service.createActivity(fakeActivity)
      testingData.push(activity.activityId)

      expect(activity).toBeDefined()
      expect(activity.activityId).toBe(fakeActivity.activityId)
      expect(activity.name).toBe(fakeActivity.name)
      expect(activity.description).toBeNull()
      expect(activity.ogImage).toBeNull()
      expect(activity.active).toBeTruthy()
    }
    {
      const fakeActivity = generateFakeActivity({ description: true })

      const activity = await service.createActivity(fakeActivity)
      testingData.push(activity.activityId)

      expect(activity).toBeDefined()
      expect(activity.activityId).toBe(fakeActivity.activityId)
      expect(activity.name).toBe(fakeActivity.name)
      expect(activity.description).toBe(fakeActivity.description)
      expect(activity.ogImage).toBeNull()
      expect(activity.active).toBeTruthy()
    }
    {
      const fakeActivity = generateFakeActivity({ ogImage: true })

      const activity = await service.createActivity(fakeActivity)
      testingData.push(activity.activityId)

      expect(activity).toBeDefined()
      expect(activity.activityId).toBe(fakeActivity.activityId)
      expect(activity.name).toBe(fakeActivity.name)
      expect(activity.description).toBeNull()
      expect(activity.ogImage).toBe(fakeActivity.ogImage)
      expect(activity.active).toBeTruthy()
    }
  })

  it('should update activity and return it', async () => {
    const fakeActivity = generateFakeActivity()

    await knex('activity').insert(fakeActivity)
    testingData.push(fakeActivity.activityId)

    {
      const activity = await service.updateActivity(
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
      const activity = await service.updateActivity(
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
      const activity = await service.updateActivity(
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
      const activity = await service.updateActivity(
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

  it('should delete activity by setting deletedAt', async () => {
    const fakeActivity = generateFakeActivity()

    await knex('activity').insert(fakeActivity)
    testingData.push(fakeActivity.activityId)

    const result = await service.deleteActivity(fakeActivity.activityId)

    expect(result).toBe(1) // Should return 1 indicating one row was affected

    const deletedActivity = await knex('activity')
      .where('activityId', fakeActivity.activityId)
      .first()

    expect(deletedActivity).toBeDefined()
    expect(deletedActivity.deletedAt).not.toBeNull()
  })

  it('should return 0 when deleting non-existent activity', async () => {
    const nonExistentId = generateFakeActivity().activityId

    const result = await service.deleteActivity(nonExistentId)

    expect(result).toBe(0) // Should return 0 indicating no rows were affected
  })
})
