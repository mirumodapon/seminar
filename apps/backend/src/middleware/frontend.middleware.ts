import type { NextFunction, Request, Response } from 'express'
import { createRequestHandler } from '@react-router/express'

export function handleFrontendServerComponents(source: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next()
    }

    const reactRouterHandler = createRequestHandler({
      build: () => import(source),
    })

    return reactRouterHandler(req, res, next)
  }
}
