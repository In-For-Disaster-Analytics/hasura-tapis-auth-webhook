// Tapis token claims interface
export interface TapisClaims {
  tenant_id?: string;
  account_type?: string;
  roles?: string[];
  username?: string;
}

// JWT token payload interface
export interface JWTPayload {
  sub?: string;
  username?: string;
  tapis?: TapisClaims;
  exp?: number;
  iat?: number;
}

// Hasura session variables interface
export interface HasuraSessionVariables {
  'X-Hasura-Role': string;
  'X-Hasura-User-Id': string;
  'X-Hasura-Tenant-Id'?: string;
  'X-Hasura-Account-Type'?: string;
  'Cache-Control'?: string;
}

// Webhook request headers interface
export interface WebhookRequestHeaders {
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
