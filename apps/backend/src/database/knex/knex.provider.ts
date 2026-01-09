import { Provider } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { knex } from 'knex'
import { KNEX_PROVIDER } from './knex.constant'

export const KnexProvider: Provider = {
  provide: KNEX_PROVIDER,
  useFactory: (configService: ConfigService) => {
    return knex(configService.get('database.knex')!)
  },
  inject: [ConfigService],
}
