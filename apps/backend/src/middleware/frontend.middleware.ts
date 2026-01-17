import type { INestApplication } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
import { resolve } from 'node:path'
import { createRequestHandler } from '@react-router/express'
import express from 'express'

export function handleFrontendServerComponents(app: INestApplication, source: string) {
  app.use(express.static(resolve(source, 'client')))
  app.use(handleFrontendServerComponentsMiddleware(resolve(source, 'server', 'index.js')))
}

export function handleFrontendServerComponentsMiddleware(source: string) {
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
