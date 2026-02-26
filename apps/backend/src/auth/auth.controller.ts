import type { Request, Response } from 'express'
import { BadRequestException, Controller, Get, Req, Res, Session, UseGuards } from '@nestjs/common'
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
    @Session() session: Record<string, any>,
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

    session.user = dbUser
    // TODO: redirect

    return dbUser
  }

  @Get('me')
  async me(@Session() session: Record<string, any>, @Res() res: Response) {
    const user = session.user

    if (user)
      return res.redirect('/apply')

    return res.redirect('/api/auth/google')
  }
}
