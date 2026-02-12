import express, { type Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from '../routes/index.js';
import { errorHandler, notFoundHandler } from '../middleware/errorHandler.js';

dotenv.config();

const app: Express = express();

const corsOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow non-browser clients or same-origin
      if (!origin) return cb(null, true);
      if (corsOrigins.length === 0) return cb(null, true);
      return corsOrigins.includes(origin) ? cb(null, true) : cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));


if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}


app.use('/api', routes);


app.use(notFoundHandler);


app.use(errorHandler);

export default app;
