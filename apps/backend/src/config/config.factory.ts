import { registerAs } from '@nestjs/config'

export default [
  registerAs('app', () => ({
    port: process.env.PORT || 3000,
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
]
