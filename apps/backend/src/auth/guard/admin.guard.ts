import type { Request } from 'express'
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const session = (request as any).session
    const user = session?.user

    if (!user) {
      throw new UnauthorizedException('請先登入')
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('需要管理員權限')
    }

    return true
  }
}
