import type { Knex } from 'knex'
import type { RedisClientType } from 'redis'
import { ForbiddenException } from '@nestjs/common'
import { ApplyScheduleService } from '../apply-schedule.service'

function createScheduleQueryBuilder(options: {
  firstResult?: unknown
  updateResult?: unknown
  insertResult?: unknown
}) {
  return {
    where: jest.fn().mockReturnThis(),
    first: jest.fn().mockResolvedValue(options.firstResult),
    update: jest.fn().mockResolvedValue(options.updateResult),
    insert: jest.fn().mockResolvedValue(options.insertResult),
  }
}

describe('applyScheduleService', () => {
  it('returns cached schedule before querying database', async () => {
    const redis = {
      get: jest.fn().mockResolvedValue(JSON.stringify({
        activityId: '2026',
        applyCreateDeadlineAt: '2099-01-01T00:00:00Z',
        applyEditDeadlineAt: null,
        slidesUploadDeadlineAt: null,
        posterUploadDeadlineAt: null,
      })),
      setEx: jest.fn(),
      del: jest.fn(),
    } as unknown as RedisClientType
    const knex = jest.fn() as unknown as Knex
    const service = new ApplyScheduleService(knex, redis)

    const schedule = await service.findByActivityId('2026')

    expect(schedule.activityId).toBe('2026')
    expect(redis.get).toHaveBeenCalledWith('activity:apply-schedule:2026')
    expect(redis.setEx).not.toHaveBeenCalled()
    expect(knex).not.toHaveBeenCalled()
  })

  it('reads database and caches schedule on cache miss', async () => {
    const queryBuilder = createScheduleQueryBuilder({
      firstResult: {
        activityId: '2026',
        applyCreateDeadlineAt: '2099-01-01 00:00:00',
        applyEditDeadlineAt: null,
        slidesUploadDeadlineAt: null,
        posterUploadDeadlineAt: null,
      },
    })
    const redis = {
      get: jest.fn().mockResolvedValue(null),
      setEx: jest.fn().mockResolvedValue(undefined),
      del: jest.fn(),
    } as unknown as RedisClientType
    const knex = jest.fn().mockReturnValue(queryBuilder) as unknown as Knex
    const service = new ApplyScheduleService(knex, redis)

    const schedule = await service.findByActivityId('2026')

    expect(schedule).toEqual({
      activityId: '2026',
      applyCreateDeadlineAt: '2099-01-01T00:00:00Z',
      applyEditDeadlineAt: null,
      slidesUploadDeadlineAt: null,
      posterUploadDeadlineAt: null,
    })
    expect(queryBuilder.where).toHaveBeenCalledWith('activityId', '2026')
    expect(redis.setEx).toHaveBeenCalledWith(
      'activity:apply-schedule:2026',
      300,
      JSON.stringify(schedule),
    )
  })

  it('blocks actions when deadline has passed', async () => {
    const redis = {
      get: jest.fn().mockResolvedValue(JSON.stringify({
        activityId: '2026',
        applyCreateDeadlineAt: '2000-01-01T00:00:00Z',
        applyEditDeadlineAt: null,
        slidesUploadDeadlineAt: null,
        posterUploadDeadlineAt: null,
      })),
      setEx: jest.fn(),
      del: jest.fn(),
    } as unknown as RedisClientType
    const knex = jest.fn() as unknown as Knex
    const service = new ApplyScheduleService(knex, redis)

    await expect(service.assertActionAllowed('2026', 'create'))
      .rejects
      .toThrow(new ForbiddenException('投稿已截止'))
  })
})
