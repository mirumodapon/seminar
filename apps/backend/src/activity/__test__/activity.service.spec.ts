import { Test, TestingModule } from '@nestjs/testing'
import { ConfigModule } from '../../config/config.module'
import { KnexProvider } from '../../database/knex/knex.provider'
import { ActivityService } from '../activity.service'

// TODO: test implement

describe('activityService', () => {
  let service: ActivityService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [ActivityService, KnexProvider],
    }).compile()

    service = module.get<ActivityService>(ActivityService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
