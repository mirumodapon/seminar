import { Module } from '@nestjs/common'
import { ActivityModule } from './activity/activity.module'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from './config/config.module'
import { KnexModule } from './database/knex/knex.module'
import { RedisModule } from './database/redis/redis.module'

@Module({
  imports: [ConfigModule, KnexModule, RedisModule, AuthModule, ActivityModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
