import { Test, TestingModule } from '@nestjs/testing'
import { RedisClientType } from 'redis'
import { ConfigModule } from '../../config/config.module'
import { REDIS_PROVIDER } from './redis.constant'
import { RedisProvider } from './redis.provider'

describe('redisProvider', () => {
  let moduleRef: TestingModule

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [RedisProvider],
    }).compile()
  })

  it('should provide a redis instance', async () => {
    const client = moduleRef.get<RedisClientType>(REDIS_PROVIDER)

    expect(client).toBeDefined()
    expect(typeof client.ping).toBe('function')
  })

  it('should connect and set/get a key', async () => {
    const client = moduleRef.get<RedisClientType>(REDIS_PROVIDER)

    const randstr = Math.random().toString(16)
    await client.set('UNIT_TEST', randstr, { expiration: { type: 'PX', value: 50 } })

    {
      const result = await client.get('UNIT_TEST')
      expect(result).toBe(randstr)
    }

    await new Promise(resolve => setTimeout(resolve, 100))

    {
      const result = await client.get('UNIT_TEST')
      expect(result).toBeNull()
    }
  })

  afterAll(async () => {
    const client = moduleRef.get<RedisClientType>(REDIS_PROVIDER)
    await client.close()
  })
})
