import type { Request } from 'express'
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'

@Injectable()
export class UserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const session = (request as any).session
    const user = session?.user

    if (!user) {
      throw new UnauthorizedException('請先登入')
    }

    return true
  }
}
