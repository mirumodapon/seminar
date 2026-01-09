import type { Request } from 'express'
import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Controller('auth')
export class AuthController {
  constructor() { }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin() { }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(
    @Req() req: Request,
  ) {
    return (req as any).user // FIX: Typing any
  }
}
