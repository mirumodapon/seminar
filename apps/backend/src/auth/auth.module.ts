import { Module } from '@nestjs/common'
import { ConfigModule } from '../config/config.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { GoogleProvider } from './provider/google.provider'

@Module({
  controllers: [AuthController],
  providers: [GoogleProvider, AuthService],
  imports: [ConfigModule],
})
export class AuthModule { }
