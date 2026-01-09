import { Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { AuthController } from './auth.controller'
import { GoogleProvider } from './provider/google.provider'

@Module({
  controllers: [AuthController],
  providers: [GoogleProvider],
  imports: [ConfigModule],
})
export class AuthModule { }
