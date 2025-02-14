import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from './config';
import authService from './services/auth.service';
import logger from './utils/logger';
import { JWKSHandler } from './utils/jwks-handler';
import {
  WebhookRequest,
  JWTPayload,
  ErrorResponse,
  HealthCheckResponse,
} from './types';

export const app = express();

// Configure JWKS handler
const jwksHandler = new JWKSHandler(config.jwksUri);

// Middleware to parse JSON requests
app.use(express.json());

// Main webhook endpoint
app.post(
  '/auth-webhook',
  async (req: Request<{}, {}, WebhookRequest>, res: Response) => {
    try {
      console.log('req.', req.body);
      const authHeader = req.body.headers.Authorization;
      if (!authHeader) {
        // Return anonymous role for unauthenticated requests
        console.log('No auth header');
        return res.status(200).json({
          'X-Hasura-Role': 'anonymous',
        });
      }
      // Extract the token
      const token = authHeader.replace('Bearer ', '');

      // Verify the JWT token using Tapis public key
      jwt.verify(
        token,
        jwksHandler.getKey,
        {
          issuer: config.tokenIssuer,
        },
        (err, decoded) => {
          if (err) {
            logger.error('Token verification failed:', err);
            return res.status(401).json({
              message: 'Invalid token',
            } as ErrorResponse);
          }

          // Create session variables from decoded token
          const sessionVariables = authService.createSessionVariables(
            decoded as JWTPayload,
          );

          // Return the session variables to Hasura
          res.status(200).json(sessionVariables);
        },
      );
    } catch (error) {
      logger.error('Webhook error:', error);
      res.status(500).json({
        message: 'Internal server error',
      } as ErrorResponse);
    }
  },
);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  } as HealthCheckResponse);
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal server error',
  } as ErrorResponse);
});

let server: ReturnType<typeof app.listen> | null = null;

export const startServer = () => {
  server = app.listen(config.port, () => {
    logger.info(`Tapis auth webhook listening on port ${config.port}`);
  });
  return server;
};

export const stopServer = () => {
  if (server) {
    server.close();
    server = null;
  }
};

// Only start the server if this file is run directly
if (require.main === module) {
  startServer();
}

export default app;
