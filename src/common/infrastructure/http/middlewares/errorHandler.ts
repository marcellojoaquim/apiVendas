import { AppError } from '@/common/domain/errors/app-error'
import { NextFunction, Request, Response } from 'express'

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response {
  if (error instanceof AppError) {
    return res
      .status(error.statusCode)
      .json({ status: 'error', message: error.message })
  }
  console.error(error)

  return res
    .status(500)
    .json({ status: 'error', message: 'Internal server error' })
}
