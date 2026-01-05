import { Global, Module } from '@nestjs/common'
import { KnexProvider } from './knex.provider'

@Global()
@Module({
  providers: [KnexProvider],
  exports: [KnexProvider],
})
export class KnexModule { }
