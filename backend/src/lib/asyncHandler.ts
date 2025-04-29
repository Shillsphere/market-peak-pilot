import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async Express route handler to catch errors and pass them to next().
 * This allows using async/await in route handlers without explicit try/catch blocks
 * that call next(error).
 * 
 * @param fn The async route handler function to wrap.
 * @returns A standard Express RequestHandler.
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler; 