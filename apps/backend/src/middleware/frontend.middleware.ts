import type { INestApplication } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
import { isAbsolute, normalize, resolve } from 'node:path'
import { createRequestHandler } from '@react-router/express'
import express from 'express'

/**
 * Validates and normalizes a source path to prevent path traversal attacks.
 *
 * @param source - The source path to validate
 * @returns The normalized absolute path
 * @throws Error if the path is not absolute
 */
function validateAndNormalizePath(source: string): string {
  // Check if the original source is absolute before normalization
  if (!isAbsolute(source)) {
    throw new Error(`Invalid source path '${source}': must be an absolute path`)
  }
  
  const normalizedSource = normalize(source)
  
  // Verify the normalized path is still absolute after normalization
  if (!isAbsolute(normalizedSource)) {
    throw new Error(`Invalid source path '${source}': resolved to relative path after normalization`)
  }
  
  return normalizedSource
}

export function handleFrontendServerComponents(app: INestApplication, source: string) {
  // Validate and normalize the source path to prevent path traversal
  const normalizedSource = validateAndNormalizePath(source)
  
  // Resolve paths - these are safe since we use hardcoded relative paths
  const clientPath = resolve(normalizedSource, 'client')
  const serverPath = resolve(normalizedSource, 'server', 'index.js')
  
  app.use(express.static(clientPath))
  app.use(handleFrontendServerComponentsMiddleware(serverPath))
}

export function handleFrontendServerComponentsMiddleware(source: string) {
  // Validate and normalize the source path once to prevent path traversal
  const normalizedSource = validateAndNormalizePath(source)
  
  // Create the request handler once and reuse it for all requests
  const reactRouterHandler = createRequestHandler({
    build: async () => {
      try {
        return await import(normalizedSource)
      }
      catch (error) {
        throw new Error(
          `Failed to load frontend server module from '${normalizedSource}': ${error instanceof Error ? error.message : String(error)}`,
        )
      }
    },
  })
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next()
    }

    // Use the pre-created handler
    return reactRouterHandler(req, res, next)
  }
}
