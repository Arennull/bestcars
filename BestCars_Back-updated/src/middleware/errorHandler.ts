import { type Request, type Response, type NextFunction } from 'express';


export const errorHandler = (
  err: Error & { status?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  
  if (err.code === 'P2002') {
    res.status(409).json({ 
      error: 'Duplicate entry. This record already exists.' 
    });
    return;
  }

  if (err.code === 'P2025') {
    res.status(404).json({ 
      error: 'Record not found.' 
    });
    return;
  }

  
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};


export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
};
