import { AuthService } from '../../services/auth.service';
import { JWTPayload } from '../../types';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('determineRole', () => {
    test('should return user role for user account type', () => {
      const token: JWTPayload = {
        jti: 'test-jti',
        iss: 'https://tacc.tapis.io/v3/tokens',
        sub: 'testuser',
        'tapis/tenant_id': 'tacc',
        'tapis/token_type': 'access',
        'tapis/delegation': false,
        'tapis/delegation_sub': null,
        'tapis/username': 'testuser',
        'tapis/account_type': 'user',
        'tapis/client_id': 'tacc.test.client',
        'tapis/grant_type': 'authorization_code',
        'tapis/redirect_uri': 'https://test.redirect',
        'tapis/refresh_count': 0,
        exp: 1739381904,
      };

      expect(authService.determineRole(token)).toBe('user');
    });

    test('should return admin role for admin account type', () => {
      const token: JWTPayload = {
        jti: 'test-jti',
        iss: 'https://tacc.tapis.io/v3/tokens',
        sub: 'admin',
        'tapis/tenant_id': 'tacc',
        'tapis/token_type': 'access',
        'tapis/delegation': false,
        'tapis/delegation_sub': null,
        'tapis/username': 'admin',
        'tapis/account_type': 'admin',
        'tapis/client_id': 'tacc.test.client',
        'tapis/grant_type': 'authorization_code',
        'tapis/redirect_uri': 'https://test.redirect',
        'tapis/refresh_count': 0,
        exp: 1739381904,
      };

      expect(authService.determineRole(token)).toBe('admin');
    });

    test('should return service role for service account type', () => {
      const token: JWTPayload = {
        jti: 'test-jti',
        iss: 'https://tacc.tapis.io/v3/tokens',
        sub: 'service',
        'tapis/tenant_id': 'tacc',
        'tapis/token_type': 'access',
        'tapis/delegation': false,
        'tapis/delegation_sub': null,
        'tapis/username': 'service',
        'tapis/account_type': 'service',
        'tapis/client_id': 'tacc.test.client',
        'tapis/grant_type': 'authorization_code',
        'tapis/redirect_uri': 'https://test.redirect',
        'tapis/refresh_count': 0,
        exp: 1739381904,
      };

      expect(authService.determineRole(token)).toBe('service');
    });

    test('should default to user role for unknown account type', () => {
      const token: JWTPayload = {
        jti: 'test-jti',
        iss: 'https://tacc.tapis.io/v3/tokens',
        sub: 'unknown',
        'tapis/tenant_id': 'tacc',
        'tapis/token_type': 'access',
        'tapis/delegation': false,
        'tapis/delegation_sub': null,
        'tapis/username': 'unknown',
        'tapis/account_type': 'unknown',
        'tapis/client_id': 'tacc.test.client',
        'tapis/grant_type': 'authorization_code',
        'tapis/redirect_uri': 'https://test.redirect',
        'tapis/refresh_count': 0,
        exp: 1739381904,
      };

      expect(authService.determineRole(token)).toBe('user');
    });
  });

  describe('createSessionVariables', () => {
    test('should create session variables from token', () => {
      const token: JWTPayload = {
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
        'tapis/grant_type': 'authorization_code',
        'tapis/redirect_uri': 'https://tacc.tapis.io/v3/oauth2/webapp/callback',
        'tapis/refresh_count': 0,
        exp: 1739381904,
      };

      const sessionVars = authService.createSessionVariables(token);

      expect(sessionVars).toEqual({
        'X-Hasura-Role': 'user',
        'X-Hasura-User-Id': 'mosorio',
        'X-Hasura-Username': 'mosorio',
        'X-Hasura-Tenant-Id': 'tacc',
        'Cache-Control': 'max-age=600',
      });
    });
  });
});
