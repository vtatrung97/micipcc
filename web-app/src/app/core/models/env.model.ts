export interface ServiceEndpoint {
  url: string;
  authJwt?: boolean;
  crossbarJwt?: boolean;
}

export interface KeycloakConfig {
  endpoint: string;
  realm?: string;
  clientId?: string;
  clientSecret?: string;
  dummyClientSecret?: string;
  requireHttps?: boolean;
  showDebugInformation?: boolean;
  strictDiscoveryDocumentValidation?: boolean;
  [key: string]: any;
}

export interface ServiceCategory {
  TICKET_SERVICE_API?: ServiceEndpoint;
  ACCOUNT_API?: ServiceEndpoint;
  NOTIFICATION_SERVER_API?: ServiceEndpoint;
  REPORT_SERVICE_API?: ServiceEndpoint;
  [key: string]: ServiceEndpoint | any;
}

export interface EnvModel {
  production?: boolean;
  PROFILE?: string;
  KEYCLOAK?: KeycloakConfig;
  SERVICES?: ServiceCategory;
  WEB_DOMAIN_URL?: string;
  DEFAULT_TIMEZONE?: string;
  AUTH_ENABLED?: boolean;
  [key: string]: any;
}
