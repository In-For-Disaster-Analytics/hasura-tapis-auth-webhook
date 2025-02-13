interface Config {
  port: number;
  jwksUri: string;
  tokenIssuer: string;
  environment: string;
  cacheMaxAge: number;
  jwksRequestsPerMinute: number;
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwksUri:
    process.env.TAPIS_JWKS_URI || 'https://tacc.tapis.io/v3/tenants/tacc',
  tokenIssuer:
    process.env.TAPIS_TOKEN_ISSUER || 'https://tacc.tapis.io/v3/oauth2',
  environment: process.env.NODE_ENV || 'development',
  cacheMaxAge: parseInt(process.env.JWKS_CACHE_MAX_AGE || '86400000', 10), // 24 hours
  jwksRequestsPerMinute: parseInt(
    process.env.JWKS_REQUESTS_PER_MINUTE || '5',
    10,
  ),
};

export default config;
