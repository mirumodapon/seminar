import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'

@Injectable()
export class AdminGuard implements CanActivate {
  constructor() { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const { user } = req.session

    return user?.role === 'admin'
  }
}

@Injectable()
export class UserGuard implements CanActivate {
  constructor() { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const { user } = req.session

    return user?.role === 'user'
  }
}
