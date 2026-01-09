import { registerAs } from '@nestjs/config'

export default [
  registerAs('app', () => ({
    port: Number(process.env.PORT) || 3000,
    session: {
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      },
    },
  })),
  registerAs('database', () => ({
    knex: {
      client: 'mysql2',
      debug: process.env.NODE_ENV === 'development',
      connection: {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
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
  registerAs('oauth', () => {
    const clientID = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const scope = process.env.GOOGLE_OAUTH_SCOPE?.split(',')
    const callbackURL = process.env.GOOGLE_CALLBACK_URL

    if (!clientID || !clientSecret) {
      throw new Error(
        'Missing Google OAuth credentials: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables must be set.',
      )
    }

    return {
      google: {
        clientID,
        clientSecret,
        callbackURL,
        scope: scope ?? [],
      },
    }
  }),
]
