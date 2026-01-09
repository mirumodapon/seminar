import { registerAs } from '@nestjs/config'

export default [
  registerAs('app', () => ({
    port: process.env.PORT || 3000,
    session: {
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      },
    },
  })),
  registerAs('database', () => ({
    knex: {
      client: 'mysql2',
      debug: process.env.NODE_ENV === 'development',
      connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        timezone: 'Z',
        dateStrings: true,
      },
      pool: { min: 0, max: 5 },
    },
    redis: {
      url: process.env.REDIS_URL,
    },
  })),
  registerAs('oauth', () => ({
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: process.env.GOOGLE_OAUTH_SCOPE?.split(',') ?? [],
    },
  })),
]
