import { Module } from '@nestjs/common'
import { ConfigModule } from './config/config.module'
import { KnexModule } from './database/knex/knex.module'

@Module({
  imports: [ConfigModule, KnexModule],
  controllers: [],
  providers: [],
})
export class AppModule { }
