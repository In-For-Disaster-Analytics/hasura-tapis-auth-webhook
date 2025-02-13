import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import app from '../server';

jest.mock('jwks-rsa');
jest.mock('jsonwebtoken');

describe('Webhook Endpoints', () => {
  describe('POST /auth-webhook', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return anonymous role when no authorization header is present', async () => {
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
            authorization: 'Bearer invalid-token',
          },
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Invalid token',
      });
    });

    it('should return session variables for valid token', async () => {
      const mockDecodedToken = {
        sub: 'user123',
        tapis: {
          account_type: 'admin',
          tenant_id: 'tacc',
          roles: ['admin'],
        },
      };

      (jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback) => {
          callback(null, mockDecodedToken);
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
        'X-Hasura-Role': 'admin',
        'X-Hasura-User-Id': 'user123',
        'X-Hasura-Tenant-Id': 'tacc',
        'X-Hasura-Account-Type': 'admin',
        'Cache-Control': 'max-age=600',
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
            authorization: 'Bearer valid-token',
          },
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Internal server error',
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
