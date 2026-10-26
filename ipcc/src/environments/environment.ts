// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import {
  AppProperty,
  KeycloakConfig,
  ServiceCategory,
} from "@core/models/env.model";

const _window: any = window;
const windowEnv = _window["env"];

export const WEB_PHONE = windowEnv.WEB_PHONE;
export const WEB_DOMAIN_URL = windowEnv.WEB_DOMAIN_URL;
export const KEYCLOAK: KeycloakConfig = windowEnv.KEYCLOAK;
export const SERVICES: ServiceCategory = windowEnv.SERVICES;
export const LOCAL_SERVICES: ServiceCategory = windowEnv.LOCAL_SERVICES;
export const PROPERTIES = windowEnv.PROPERTIES;
export const REPORT_PROPERTIES = windowEnv.REPORT_PROPERTIES;
export const BCCS_URL = windowEnv.BCCS_URL;
export const ZALO_AUTH_URL = windowEnv.ZALO_AUTH_URL;
export const ZALO_CALLBACK = windowEnv.ZALO_CALLBACK;
export const ZONE_ALIAS = windowEnv.ZONE_ALIAS;
export const FACEBOOK_PROPERTIES = windowEnv.FACEBOOK_PROPERTIES;
export const CALL_BOT = windowEnv.CALL_BOT;
export const AGENTMATE = windowEnv.AGENTMATE;
export const WHATSAPP = windowEnv.WHATSAPP;
export const TICKET_CALL_FLOWS = windowEnv.TICKET_CALL_FLOWS;

export const environment = {
  production: false,
  stompDebug: false,
  WEB_PHONE: WEB_PHONE,
  WEB_DOMAIN_URL: WEB_DOMAIN_URL,
  REPORT_PROPERTIES: REPORT_PROPERTIES,
  FACEBOOK_PROPERTIES: FACEBOOK_PROPERTIES,
  CALL_BOT: CALL_BOT,
  AGENTMATE: AGENTMATE,
  WHATSAPP: WHATSAPP,
  TICKET_CALL_FLOWS: TICKET_CALL_FLOWS
};


/**
 * Trỏ lại url cho một số API về môi trường local, dev phục vụ dev nếu cần
 */
// SERVICES.ACD_SERVICE_API.url = 'http://demo.127.0.0.1.nip.io:9290'
// SERVICES.ACCOUNT_API.url = 'http://localhost:8010'
// SERVICES.EMAIL_GATEWAY_SERVICE_API.url = 'http://demo.127.0.0.1.nip.io:9908'
// SERVICES.TICKET_SERVICE_API.url = 'http://demo.localhost:9997'
// SERVICES.CHAT_SERVICE_API.url = 'http://demo.localhost:9999'
// SERVICES.BOT_SERVER_API.url = 'http://demo.localhost:9998'
// SERVICES.CCMS_SERVICE_API.url = 'http://demo.localhost:9654'
// SERVICES.REPORT_SERVICE_API.url = 'http://demo.localhost:8105'
// SERVICES.QUALITY_SERVICE_API.url = 'http://localhost:9456'
// SERVICES.CAMPAIGN_SERVICE_API.url = 'http://demo.localhost:9565'
// SERVICES.MONITOR_SERVER_API.url = 'http://localhost:9321'
// SERVICES.CHAT_SERVER_API.url = 'http://demo.localhost:8081'

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
*/
