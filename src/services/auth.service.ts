import { JWTPayload, HasuraSessionVariables } from '../types';
import logger from '../utils/logger';

export class AuthService {
  public determineRole(decodedToken: JWTPayload): string {
    try {
      // Check for admin privileges in Tapis claims
      if (
        decodedToken.tapis?.account_type === 'admin' ||
        (decodedToken.tapis?.roles &&
          decodedToken.tapis.roles.includes('admin'))
      ) {
        return 'admin';
      }

      // Check for service account
      if (decodedToken.tapis?.account_type === 'service') {
        return 'service';
      }

      // Default role
      return 'user';
    } catch (error) {
      logger.error('Error determining role:', error);
      return 'user'; // Default to user role on error
    }
  }

  public createSessionVariables(
    decodedToken: JWTPayload,
  ): HasuraSessionVariables {
    const sessionVars: HasuraSessionVariables = {
      'X-Hasura-Role': this.determineRole(decodedToken),
      'X-Hasura-User-Id':
        decodedToken.sub || decodedToken.username || 'anonymous',
      'Cache-Control': 'max-age=600',
    };

    // Add tenant ID if available
    if (decodedToken.tapis?.tenant_id) {
      sessionVars['X-Hasura-Tenant-Id'] = decodedToken.tapis.tenant_id;
    }

    // Add account type if available
    if (decodedToken.tapis?.account_type) {
      sessionVars['X-Hasura-Account-Type'] = decodedToken.tapis.account_type;
    }

    return sessionVars;
  }
}

export default new AuthService();
