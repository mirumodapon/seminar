import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: false,
    transformOptions: {
      exposeUnsetFields: false,
    },
  }))

  app.setGlobalPrefix('api')
  await app.listen(config.get('app.port')!)
}

bootstrap()
