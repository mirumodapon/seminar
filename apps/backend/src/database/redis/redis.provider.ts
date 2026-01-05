import { Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createClient } from 'redis'
import { REDIS_PROVIDER } from './redis.constant'

export const RedisProvider: Provider = {
  provide: REDIS_PROVIDER,
  useFactory: async (configService: ConfigService) => {
    const client = await createClient(configService.get('database.redis'))
      .connect()

    return client
  },
  inject: [ConfigService],
}
