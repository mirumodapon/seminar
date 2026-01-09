import type { Knex } from 'knex'
import { Inject, Injectable } from '@nestjs/common'
import { KNEX_PROVIDER } from '../database/knex/knex.constant'

@Injectable()
export class AuthService {
  constructor(@Inject(KNEX_PROVIDER) private readonly knex: Knex) {
  }

  findUserByEmail(email: string) {
    return this.knex('user')
      .where('email', email)
      .whereNull('deletedAt')
      .first()
  }

  findUserById(id: number) {
    return this.knex('user')
      .where('userId', id)
      .first()
  }

  async createUser(user: any) { // FIX: any type
    const [userId] = await this.knex('user')
      .insert(user)

    return this.findUserById(userId)
  }
}
