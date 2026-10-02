(function (window) {
  window.env = window.env || {};

  const PROFILE = "IPCC2_DEV";

  /*========================================================================*/
  const KEYCLOAK = {
    endpoint: 'http://192.168.10.27:8081',
    realm: 'ticket-flow',
    clientId: 'agent-web',
    requireHttps: false,
    showDebugInformation: false,
    strictDiscoveryDocumentValidation: false
  };

  /*========================================================================*/
  const WEB_DOMAIN_URL = '';
  const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

  /*========================================================================*/
  const SERVICES = {
    TICKET_SERVICE_API: { url: 'https://demo.moj.gov.vn:8100/ticket-service', authJwt: true, crossbarJwt: false },
    ACCOUNT_API: { url: 'https://demo.moj.gov.vn:8100/account-server', authJwt: true, crossbarJwt: false },
    NOTIFICATION_SERVER_API: { url: 'https://demo.moj.gov.vn:8100/notification-server', authJwt: true, crossbarJwt: false },
    REPORT_SERVICE_API: { url: 'https://demo.moj.gov.vn:8100/service-report', authJwt: true, crossbarJwt: false }
  };

  /*========================================================================*/
  window.env.production = false;
  window.env.PROFILE = PROFILE;
  window.env.KEYCLOAK = KEYCLOAK;
  window.env.SERVICES = SERVICES;
  window.env.WEB_DOMAIN_URL = WEB_DOMAIN_URL;
  window.env.DEFAULT_TIMEZONE = DEFAULT_TIMEZONE;

  console.log("=======================TICKET_FLOW_PROFILE=======================");
  console.log("PROFILE " + PROFILE + ", ENV: ", window.env);
  console.log("================================================================");
}(this));
