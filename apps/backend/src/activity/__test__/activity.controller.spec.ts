import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '../../config/config.module'
import { KnexModule } from '../../database/knex/knex.module'
import { ActivityController } from '../activity.controller'
import { ActivityService } from '../activity.service'

// TODO: test implement

describe('activityController', () => {
  let controller: ActivityController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, KnexModule],
      controllers: [ActivityController],
      providers: [ActivityService],
    }).compile()

    controller = module.get<ActivityController>(ActivityController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
