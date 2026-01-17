import { randomBytes } from 'node:crypto'
import { Test, TestingModule } from '@nestjs/testing'
import { Knex } from 'knex'
import { ConfigModule } from '../../config/config.module'
import { KNEX_PROVIDER } from '../../database/knex/knex.constant'
import { KnexProvider } from '../../database/knex/knex.provider'
import { AuthService } from '../auth.service'

describe('authService', () => {
  let moduleRef: TestingModule
  const testingData: number[] = []

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [KnexProvider, AuthService],
    }).compile()
  })

  afterAll(async () => {
    const knexInstance = moduleRef.get<Knex>(KNEX_PROVIDER)

    await knexInstance('user')
      .delete()
      .whereIn('userId', testingData)

    await knexInstance.destroy()
  })

  it('should be defined', () => {
    const authService = moduleRef.get<AuthService>(AuthService)
    expect(authService).toBeDefined()
  })

  it('should create user', async () => {
    const authService = moduleRef.get<AuthService>(AuthService)

    const name = randomBytes(10).toString('base64')
    const email = `${name}@seminar.nptucsai.org`

    const user = await authService.createUser({ email, name })
    testingData.push(user.userId)

    expect(user).toBeDefined()
    expect(user.email).toBe(email)
    expect(user.name).toBe(name)
    expect(user.deletedAt).toBeNull()
    expect(user.role).toBe('user')
  })

  it('should find user by email', async () => {
    const authService = moduleRef.get<AuthService>(AuthService)

    const name = randomBytes(10).toString('base64')
    const email = `${name}@seminar.nptucsai.org`

    const user = await authService.createUser({ email, name })
    testingData.push(user.userId)

    const foundUser = await authService.findUserByEmail(email)

    expect(foundUser).toBeDefined()
    expect(foundUser.email).toBe(email)
    expect(foundUser.name).toBe(name)
    expect(foundUser.deletedAt).toBeNull()
    expect(foundUser.role).toBe('user')
  })

  it('should find user by id', async () => {
    const authService = moduleRef.get<AuthService>(AuthService)

    const name = randomBytes(12).toString('base64')
    const email = `${name}@seminar.nptucsai.org`

    const user = await authService.createUser({ email, name })
    testingData.push(user.userId)

    const foundUser = await authService.findUserById(user.userId)

    expect(foundUser).toBeDefined()
    expect(foundUser.email).toBe(email)
    expect(foundUser.name).toBe(name)
    expect(foundUser.deletedAt).toBeNull()
    expect(foundUser.role).toBe('user')
  })
})
