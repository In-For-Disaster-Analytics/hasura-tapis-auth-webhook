// Tapis token claims interface
export interface TapisClaims {
  'tapis/tenant_id': string;
  'tapis/token_type': string;
  'tapis/delegation': boolean;
  'tapis/delegation_sub': string | null;
  'tapis/username': string;
  'tapis/account_type': string;
  'tapis/client_id': string;
  'tapis/grant_type': string;
  'tapis/redirect_uri': string;
  'tapis/refresh_count': number;
}

// JWT token payload interface
export interface JWTPayload extends TapisClaims {
  jti: string;
  iss: string;
  sub: string;
  exp: number;
}

// Hasura session variables interface
export interface HasuraSessionVariables {
  'X-Hasura-Role': string;
  'X-Hasura-User-Id': string;
  'X-Hasura-Username': string;
  'X-Hasura-Tenant-Id': string;
  'Cache-Control'?: string;
}

// Webhook request headers interface
export interface WebhookRequestHeaders {
  Authorization?: string;
  authorization?: string;
  [key: string]: string | undefined;
}

// Webhook request body interface
export interface WebhookRequest {
  headers: WebhookRequestHeaders;
}

// Error response interface
export interface ErrorResponse {
  message: string;
  details?: unknown;
}

// Health check response interface
export interface HealthCheckResponse {
  status: string;
  timestamp: string;
}
