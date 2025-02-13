import { AuthService } from '../../services/auth.service';
import { JWTPayload } from '../../types';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('determineRole', () => {
    it('should return admin role for admin account type', () => {
      const token: JWTPayload = {
        sub: 'user123',
        tapis: {
          account_type: 'admin',
          tenant_id: 'tacc',
        },
      };

      expect(authService.determineRole(token)).toBe('admin');
    });

    it('should return admin role for user with admin role', () => {
      const token: JWTPayload = {
        sub: 'user123',
        tapis: {
          roles: ['admin', 'user'],
          tenant_id: 'tacc',
        },
      };

      expect(authService.determineRole(token)).toBe('admin');
    });

    it('should return service role for service account type', () => {
      const token: JWTPayload = {
        sub: 'service123',
        tapis: {
          account_type: 'service',
          tenant_id: 'tacc',
        },
      };

      expect(authService.determineRole(token)).toBe('service');
    });

    it('should return user role as default', () => {
      const token: JWTPayload = {
        sub: 'user123',
        tapis: {
          tenant_id: 'tacc',
        },
      };

      expect(authService.determineRole(token)).toBe('user');
    });

    it('should handle undefined tapis claims', () => {
      const token: JWTPayload = {
        sub: 'user123',
      };

      expect(authService.determineRole(token)).toBe('user');
    });
  });

  describe('createSessionVariables', () => {
    it('should create session variables with all available claims', () => {
      const token: JWTPayload = {
        sub: 'user123',
        tapis: {
          account_type: 'admin',
          tenant_id: 'tacc',
          roles: ['admin'],
        },
      };

      const sessionVars = authService.createSessionVariables(token);

      expect(sessionVars).toEqual({
        'X-Hasura-Role': 'admin',
        'X-Hasura-User-Id': 'user123',
        'X-Hasura-Tenant-Id': 'tacc',
        'X-Hasura-Account-Type': 'admin',
        'Cache-Control': 'max-age=600',
      });
    });

    it('should handle missing optional claims', () => {
      const token: JWTPayload = {
        sub: 'user123',
      };

      const sessionVars = authService.createSessionVariables(token);

      expect(sessionVars).toEqual({
        'X-Hasura-Role': 'user',
        'X-Hasura-User-Id': 'user123',
        'Cache-Control': 'max-age=600',
      });
    });

    it('should use username if sub is not available', () => {
      const token: JWTPayload = {
        username: 'testuser',
        tapis: {
          tenant_id: 'tacc',
        },
      };

      const sessionVars = authService.createSessionVariables(token);

      expect(sessionVars).toEqual({
        'X-Hasura-Role': 'user',
        'X-Hasura-User-Id': 'testuser',
        'X-Hasura-Tenant-Id': 'tacc',
        'Cache-Control': 'max-age=600',
      });
    });
  });
});
