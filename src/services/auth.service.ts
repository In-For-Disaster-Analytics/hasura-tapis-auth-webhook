import { JWTPayload, HasuraSessionVariables } from '../types';
import logger from '../utils/logger';

export class AuthService {
  public determineRole(decodedToken: JWTPayload): string {
    try {
      const accountType = decodedToken['tapis/account_type'];
      logger.info('accountType', accountType);

      switch (accountType) {
        case 'admin':
          return 'admin';
        case 'service':
          return 'service';
        case 'user':
          return 'user';
        default:
          logger.warn(
            `Unknown account type: ${accountType}, defaulting to user role`,
          );
          return 'user';
      }
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
      'X-Hasura-User-Id': decodedToken['tapis/username'],
      'X-Hasura-Username': decodedToken['tapis/username'],
      'X-Hasura-Tenant-Id': decodedToken['tapis/tenant_id'],
      'Cache-Control': 'max-age=600',
    };

    return sessionVars;
  }
}

export default new AuthService();
