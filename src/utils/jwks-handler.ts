import { GetPublicKeyOrSecret } from 'jsonwebtoken';
import { JwksClient } from 'jwks-rsa';

interface TapisResponse {
  result: {
    public_key: string;
    [key: string]: any;
  };
  status: string;
  message: string;
  version: string;
}

export class JWKSHandler {
  private client: JwksClient;
  private jwksUri: string;

  constructor(jwksUri: string) {
    this.jwksUri = jwksUri;
    this.client = new JwksClient({
      jwksUri,
      requestHeaders: {}, // Add any needed headers
      timeout: 30000, // 30 second timeout
      cache: true,
      cacheMaxAge: 86400000, // 1 day
      rateLimit: true,
      jwksRequestsPerMinute: 10,
    });
  }

  public getKey: GetPublicKeyOrSecret = async (header, callback) => {
    try {
      const response = await fetch(this.jwksUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch JWKS: ${response.statusText}`);
      }

      const data = (await response.json()) as TapisResponse;

      // Extract the public key from the result object
      const publicKey = data.result.public_key;

      if (!publicKey) {
        throw new Error('No public key found in response');
      }

      callback(null, publicKey);
    } catch (error) {
      console.error('Error fetching JWKS:', error);
      callback(error as Error);
    }
  };
}
