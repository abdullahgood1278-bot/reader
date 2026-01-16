import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token error' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatted' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token invalid' });
    }

    req.user = decoded as JWTPayload;
    return next();
  });
};
