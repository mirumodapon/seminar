import type { INestApplication } from '@nestjs/common'
import type { NextFunction, Request, Response } from 'express'
import { isAbsolute, normalize, relative, resolve } from 'node:path'
import { createRequestHandler } from '@react-router/express'
import express from 'express'

/**
 * Validates that a resolved path is safe and within expected boundaries.
 * Prevents path traversal attacks by ensuring the path doesn't escape the base directory.
 * 
 * @param basePath - The base directory path
 * @param resolvedPath - The resolved path to validate
 * @throws Error if the path is invalid or attempts path traversal
 */
function validatePath(basePath: string, resolvedPath: string): void {
  // Normalize both paths to remove any '..' or '.' segments
  const normalizedBase = normalize(basePath)
  const normalizedResolved = normalize(resolvedPath)
  
  // Ensure the resolved path is absolute
  if (!isAbsolute(normalizedResolved)) {
    throw new Error(`Invalid path: resolved path must be absolute`)
  }
  
  // Calculate the relative path from base to resolved
  const relativePath = relative(normalizedBase, normalizedResolved)
  
  // Check if the relative path tries to escape the base directory
  // A safe path should not start with '..' or be an absolute path
  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    throw new Error(`Path traversal detected: ${resolvedPath} is outside the allowed directory ${basePath}`)
  }
}

export function handleFrontendServerComponents(app: INestApplication, source: string) {
  // Normalize and validate the source path first
  const normalizedSource = normalize(source)
  
  // Ensure source is an absolute path
  if (!isAbsolute(normalizedSource)) {
    throw new Error(`Invalid source path: must be an absolute path`)
  }
  
  // Resolve and validate paths
  const clientPath = resolve(normalizedSource, 'client')
  const serverPath = resolve(normalizedSource, 'server', 'index.js')
  
  // Validate that paths don't escape the source directory
  validatePath(normalizedSource, clientPath)
  validatePath(normalizedSource, serverPath)
  
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
