import { Test, TestingModule } from '@nestjs/testing'
import { Knex } from 'knex'
import { ConfigModule } from '../../config/config.module'
import { KNEX_PROVIDER } from './knex.constant'
import { KnexProvider } from './knex.provider'

describe('knexProvider', () => {
  let moduleRef: TestingModule

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [KnexProvider],
    }).compile()
  })

  it('should provide a knex instance', async () => {
    const knexInstance = moduleRef.get<Knex>(KNEX_PROVIDER)
    expect(knexInstance).toBeDefined()
    expect(typeof knexInstance.raw).toBe('function')
  })

  it('should connect and run a simple query', async () => {
    const knexInstance = moduleRef.get<Knex>(KNEX_PROVIDER)

    const [[{ val }]] = await knexInstance.raw('SELECT 1 + 1 as val')
    expect(val).toBe(2)
  })

  afterAll(async () => {
    const knexInstance = moduleRef.get<Knex>(KNEX_PROVIDER)
    await knexInstance.destroy()
  })
})
