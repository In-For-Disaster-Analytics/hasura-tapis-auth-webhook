import request from 'supertest';
import jwt from 'jsonwebtoken';
import { startServer, stopServer } from '../server';
import app from '../server';
import { JWTPayload } from '../types';

jest.mock('jwks-rsa');
jest.mock('jsonwebtoken');

describe('Webhook Endpoints', () => {
  beforeAll(() => {
    startServer();
  });

  afterAll((done) => {
    stopServer();
    done();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth-webhook', () => {
    const mockValidToken: JWTPayload = {
      jti: 'dea885fc-b59d-4dd4-9c6a-60b28406e7b2',
      iss: 'https://tacc.tapis.io/v3/tokens',
      sub: 'mosorio',
      'tapis/tenant_id': 'tacc',
      'tapis/token_type': 'access',
      'tapis/delegation': false,
      'tapis/delegation_sub': null,
      'tapis/username': 'mosorio',
      'tapis/account_type': 'user',
      'tapis/client_id': 'tacc.CIC.tokenapp',
      'tapis/grant_type': 'Authorization_code',
      'tapis/redirect_uri': 'https://tacc.tapis.io/v3/oauth2/webapp/callback',
      'tapis/refresh_count': 0,
      exp: 1739381904,
    };

    const mockAdminToken: JWTPayload = {
      ...mockValidToken,
      sub: 'admin',
      'tapis/username': 'admin',
      'tapis/account_type': 'admin',
    };

    it('should return anonymous role when no Authorization header is present', async () => {
      const response = await request(app).post('/auth-webhook').send({
        headers: {},
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        'X-Hasura-Role': 'anonymous',
      });
    });

    it('should return 401 for invalid token', async () => {
      (jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback) => {
          callback(new Error('Invalid token'));
        },
      );

      const response = await request(app)
        .post('/auth-webhook')
        .send({
          headers: {
            Authorization: 'Bearer invalid-token',
          },
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Invalid token',
      });
    });

    it('should return user role session variables for valid user token', async () => {
      (jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback) => {
          callback(null, mockValidToken);
        },
      );

      const response = await request(app)
        .post('/auth-webhook')
        .send({
          headers: {
            Authorization: 'Bearer valid-token',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        'X-Hasura-Role': 'user',
        'X-Hasura-User-Id': 'mosorio',
        'X-Hasura-Username': 'mosorio',
        'X-Hasura-Tenant-Id': 'tacc',
        'Cache-Control': 'max-age=600',
      });
    });

    it('should return admin role session variables for admin token', async () => {
      (jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback) => {
          callback(null, mockAdminToken);
        },
      );

      const response = await request(app)
        .post('/auth-webhook')
        .send({
          headers: {
            Authorization: 'Bearer admin-token',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        'X-Hasura-Role': 'admin',
        'X-Hasura-User-Id': 'admin',
        'X-Hasura-Username': 'admin',
        'X-Hasura-Tenant-Id': 'tacc',
        'Cache-Control': 'max-age=600',
      });
    });

    it('should handle expired tokens', async () => {
      (jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback) => {
          callback(new jwt.TokenExpiredError('Token expired', new Date()));
        },
      );

      const response = await request(app)
        .post('/auth-webhook')
        .send({
          headers: {
            Authorization: 'Bearer expired-token',
          },
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Invalid token',
      });
    });

    it('should handle malformed tokens', async () => {
      (jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback) => {
          callback(new jwt.JsonWebTokenError('Malformed token'));
        },
      );

      const response = await request(app)
        .post('/auth-webhook')
        .send({
          headers: {
            Authorization: 'Bearer malformed-token',
          },
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Invalid token',
      });
    });

    it('should handle server errors gracefully', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const response = await request(app)
        .post('/auth-webhook')
        .send({
          headers: {
            Authorization: 'Bearer valid-token',
          },
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Internal server error',
      });
    });

    it('should handle lowercase authorization header', async () => {
      (jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback) => {
          callback(null, mockValidToken);
        },
      );

      const response = await request(app)
        .post('/auth-webhook')
        .send({
          headers: {
            authorization: 'Bearer valid-token',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        'X-Hasura-Role': 'user',
        'X-Hasura-User-Id': 'mosorio',
        'X-Hasura-Username': 'mosorio',
        'X-Hasura-Tenant-Id': 'tacc',
        'Cache-Control': 'max-age=600',
      });
    });
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
});
