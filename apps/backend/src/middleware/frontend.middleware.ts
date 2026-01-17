import type { INestApplication } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
import { isAbsolute, normalize, resolve } from 'node:path'
import { createRequestHandler } from '@react-router/express'
import express from 'express'

export function handleFrontendServerComponents(app: INestApplication, source: string) {
  // Normalize and validate the source path first
  const normalizedSource = normalize(source)
  
  // Ensure source is an absolute path to prevent path traversal
  if (!isAbsolute(normalizedSource)) {
    throw new Error(`Invalid source path: must be an absolute path`)
  }
  
  // Resolve paths - these are safe since we use hardcoded relative paths
  const clientPath = resolve(normalizedSource, 'client')
  const serverPath = resolve(normalizedSource, 'server', 'index.js')
  
  app.use(express.static(clientPath))
  app.use(handleFrontendServerComponentsMiddleware(serverPath))
}

export function handleFrontendServerComponentsMiddleware(source: string) {
  // Validate the source path is absolute and normalized to prevent path traversal
  const normalizedSource = normalize(source)
  if (!isAbsolute(normalizedSource)) {
    throw new Error(`Invalid source path: must be an absolute path`)
  }
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next()
    }

    // Use the validated and normalized path for the dynamic import
    const reactRouterHandler = createRequestHandler({
      build: () => import(normalizedSource),
    })

    return reactRouterHandler(req, res, next)
  }
}
