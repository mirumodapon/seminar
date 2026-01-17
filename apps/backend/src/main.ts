import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { RedisStore } from 'connect-redis'
import session, { SessionOptions } from 'express-session'
import { AppModule } from './app.module'
import { REDIS_PROVIDER } from './database/redis/redis.constant'
import { handleFrontendServerComponents } from './middleware/frontend.middleware'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const redis = app.get(REDIS_PROVIDER)

  handleFrontendServerComponents(app, config.get('frontend')!.resource)

  app.use(session({
    ...config.get<SessionOptions>('app.session', { secret: '' }),
    store: new RedisStore({ client: redis }),
  }))

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
