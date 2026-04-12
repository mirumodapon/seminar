import type { ExecutionContext } from '@nestjs/common'
import { NotFoundException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ApplyScheduleGuard } from '../apply-schedule.guard'

function createExecutionContext(request: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as ExecutionContext
}

describe('applyScheduleGuard', () => {
  it('checks create action with activityId from request body', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue('create'),
    } as unknown as Reflector
    const applyService = {
      findOne: jest.fn(),
    }
    const applyScheduleService = {
      assertActionAllowed: jest.fn().mockResolvedValue(undefined),
    }
    const guard = new ApplyScheduleGuard(reflector, applyService as any, applyScheduleService as any)

    await expect(guard.canActivate(createExecutionContext({
      body: { activityId: '2026' },
      params: {},
    }))).resolves.toBe(true)

    expect(applyService.findOne).not.toHaveBeenCalled()
    expect(applyScheduleService.assertActionAllowed).toHaveBeenCalledWith('2026', 'create')
  })

  it('checks edit action with activityId resolved from applyId', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue('edit'),
    } as unknown as Reflector
    const applyService = {
      findOne: jest.fn().mockResolvedValue({ activityId: '2026' }),
    }
    const applyScheduleService = {
      assertActionAllowed: jest.fn().mockResolvedValue(undefined),
    }
    const guard = new ApplyScheduleGuard(reflector, applyService as any, applyScheduleService as any)

    await expect(guard.canActivate(createExecutionContext({
      params: { applyId: '8' },
    }))).resolves.toBe(true)

    expect(applyService.findOne).toHaveBeenCalledWith(8)
    expect(applyScheduleService.assertActionAllowed).toHaveBeenCalledWith('2026', 'edit')
  })

  it('throws when applyId cannot be resolved to a submission', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue('slidesUpload'),
    } as unknown as Reflector
    const applyService = {
      findOne: jest.fn().mockResolvedValue(undefined),
    }
    const applyScheduleService = {
      assertActionAllowed: jest.fn(),
    }
    const guard = new ApplyScheduleGuard(reflector, applyService as any, applyScheduleService as any)

    await expect(guard.canActivate(createExecutionContext({
      params: { applyId: '99' },
    }))).rejects.toThrow(new NotFoundException('找不到此投稿'))
  })
})
