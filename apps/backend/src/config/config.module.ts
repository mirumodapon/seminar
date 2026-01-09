import { ConfigModule as _ConfigModule } from '@nestjs/config'
import factory from './config.factory'

const NODE_ENV = process.env.NODE_ENV ?? 'development'

export const ConfigModule = _ConfigModule.forRoot({
  envFilePath: [
    `/run/secrets/.env`,
    `.env.${NODE_ENV}.local`,
    `.env.${NODE_ENV}`,
    '.env.local',
    '.env',
  ],
  load: factory,
  isGlobal: true,
})
