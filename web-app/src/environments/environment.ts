import {
  KeycloakConfig,
  ServiceCategory,
} from "@core/models/env.model";

const _window: any = window;
const windowEnv = _window["env"] || {};

export const KEYCLOAK: KeycloakConfig = windowEnv.KEYCLOAK || {
  endpoint: 'http://localhost:8080/auth',
  realm: 'ticket-flow',
  clientId: 'ticket-flow-web'
};

export const SERVICES: ServiceCategory = windowEnv.SERVICES || {
  TICKET_SERVICE_API: { url: 'http://localhost:8080/api/v1', authJwt: true, crossbarJwt: false },
  ACCOUNT_API: { url: 'http://localhost:8080/account-server', authJwt: true, crossbarJwt: false },
  NOTIFICATION_SERVER_API: { url: 'http://localhost:8080/notification-server', authJwt: true, crossbarJwt: false },
  REPORT_SERVICE_API: { url: 'http://localhost:8080/service-report', authJwt: true, crossbarJwt: false }
};

export const WEB_DOMAIN_URL: string = windowEnv.WEB_DOMAIN_URL || '';
export const DEFAULT_TIMEZONE: string = windowEnv.DEFAULT_TIMEZONE || 'Asia/Ho_Chi_Minh';

export const environment = {
  production: windowEnv.production ?? false,
  stompDebug: false,
  apiUrl: windowEnv.SERVICES?.TICKET_SERVICE_API?.url || 'http://localhost:8080/api/v1',
  enableDebugLogs: true,
  KEYCLOAK,
  SERVICES,
  WEB_DOMAIN_URL,
  DEFAULT_TIMEZONE
};
