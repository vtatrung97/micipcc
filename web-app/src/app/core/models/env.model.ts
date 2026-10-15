export interface KeycloakConfig {
    endpoint: string
    requireHttps: boolean
    showDebugInformation: boolean
    strictDiscoveryDocumentValidation: boolean
}

export interface ServiceAuthConfig {
    url: string
    authJwt: boolean
}

export interface ServiceCategory {
    SERVICE_PIVOT_API: ServiceAuthConfig;
    REPORT_SERVICE_API: ServiceAuthConfig;
    ACCOUNT_API: ServiceAuthConfig;
    ACD_SERVICE_API: ServiceAuthConfig;
    AGENT_SERVER_API: ServiceAuthConfig;
    AGENT_NOTIFY_SERVER_API: ServiceAuthConfig;
    NOTIFICATION_SERVER_API: ServiceAuthConfig;
    CHAT_SERVER_API: ServiceAuthConfig;
    CHAT_SERVICE_API: ServiceAuthConfig;
    EMAIL_SERVICE_API: ServiceAuthConfig;
    TICKET_SERVICE_API: ServiceAuthConfig;
    EMAIL_GATEWAY_SERVICE_API: ServiceAuthConfig;
    VIBER_GATEWAY_SERVICE_API: ServiceAuthConfig;
    SOCIAL_GATEWAY_SERVICE_API: ServiceAuthConfig;
    FIREBASE_API: ServiceAuthConfig;
    METABASE_API: ServiceAuthConfig;
    CAMPAIGN_SERVICE_API: ServiceAuthConfig;
    PIVOT_SERVICE_API: ServiceAuthConfig;
    CCMS_SERVICE_API: ServiceAuthConfig;
    QUALITY_SERVICE_API: ServiceAuthConfig;
    MONITOR_SERVER_API: ServiceAuthConfig;
    SCORE_SERVICE_API: ServiceAuthConfig;
    HAPPY_CALL_SERVICE_API: ServiceAuthConfig;
    CALL_BACK_SERVICE_API: ServiceAuthConfig;
    CALL_BOT_SERVICE_API: ServiceAuthConfig;
    BOT_SERVER_API: ServiceAuthConfig;
    SYNC_SERVICE_API:ServiceAuthConfig;
    CORE_SERVICE_API?: ServiceAuthConfig;
    ENGINE_SERVICE_API?: ServiceAuthConfig;
    INTEGRATION_SERVICE_API?: ServiceAuthConfig;
    [key: string]: any;
}

export interface AppProperty {
    NUMBER_MESSAGE: number
    DEFAULT_FILE_SIZE: number
    MAXIMUM_TICKET: number
    MAXIMUM_MESSAGE: number
    TYPING_OFF: number
    NOTI_NEW_TICKET_TIME: number
    MAXIMUM_NOTI: number
}

export interface AgentMateBotOption {
    key: string;
    label: string;
    botId: string;
    contentText: string;
  }
