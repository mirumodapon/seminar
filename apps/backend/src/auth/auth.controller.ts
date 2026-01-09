import type { Request } from 'express'
import { BadRequestException, Controller, Get, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) { }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() { }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(
    @Req() req: Request,
  ) {
    const user = (req as any).user // FIX: any type

    if (!user) {
      throw new BadRequestException()
    }

    let dbUser = await this.authService.findUserByEmail(user.email)

    if (!dbUser) {
      dbUser = await this.authService.createUser({
        email: user.email,
        name: user.name,
      })
    }

    // TODO: set session cookie
    // TODO: redirect

    return dbUser
  }
}
