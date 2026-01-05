import type { Knex } from 'knex'
import { config as dotenv } from 'dotenv'

dotenv({ path: ['.env.local', '.env'] })

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT!,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    },
  },

  staging: {
  },

  production: {
  },
}

module.exports = config
