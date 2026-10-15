(function (window) {
    window.env = window.env || {};

    const PROFILE = "IPCC2_DEV";

    /*================================================================================================================*/
    const KEYCLOAK = {
        endpoint: '${KEYCLOAK_BASE_PUBLIC}',
        requireHttps: false,
        showDebugInformation: false,
        strictDiscoveryDocumentValidation: false
    };
    /*================================================================================================================*/
    const WEB_PHONE = 'https://demo.unitel.com.la:9976/webphone"';
    const WEB_DOMAIN_URL = '${CHAT_PORTAL_URL}';
    const BCCS_URL="http://10.240.147.246/BCCS_CC/"
    const ZALO_AUTH_URL="https://oauth.zaloapp.com/v4";
    const ZALO_CALLBACK="https://cc.vietteltelecom.vn/chat-service/public/api/v1/zalo-accounts/callback"

    const SERVICES = {
        CROSSBAR: {url: '${CROSSBAR_PUBLIC}', authJwt: false, crossbarJwt: true},
        ACCOUNT_API: {url: '${ACCOUNT_SERVER_PUBLIC}', authJwt: true, crossbarJwt: false},
        ACD_SERVICE_API: {url: '${ACD_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        CHAT_SERVER_API: {url: '${CHAT_SERVER_PUBLIC}', authJwt: true, crossbarJwt: false},
        AGENT_SERVER_API: {url: '${AGENT_SERVER_PUBLIC}', authJwt: true, crossbarJwt: false},
        AGENT_NOTIFY_SERVER_API: {url: '${AGENT_NOTIFY_SERVER_PUBLIC}', authJwt: true, crossbarJwt: false},
        NOTIFICATION_SERVER_API: {url: '${NOTIFICATION_SERVER_PUBLIC}', authJwt: true, crossbarJwt: false},
        CHAT_SERVICE_API: {url: '${CHAT_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        EMAIL_SERVICE_API: {url: '${EMAIL_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        TICKET_SERVICE_API: {url: '${TICKET_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        CAMPAIGN_SERVICE_API: {url: '${CAMPAIGN_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        CCMS_SERVICE_API: {url: '${CCMS_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        PIVOT_SERVICE_API: {url: '${PIVOT_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        SERVICE_PIVOT_API: {url: '${PIVOT_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        EMAIL_GATEWAY_SERVICE_API: {url: '${EMAIL_GATEWAY_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        SOCIAL_GATEWAY_SERVICE_API: {url: '${SOCIAL_GATEWAY_PUBLIC}', authJwt: true, crossbarJwt: false},
        REPORT_SERVICE_API: {url: '${REPORT_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        QUALITY_SERVICE_API: {url: '${QUALITY_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        MONITOR_SERVER_API: {url: '${MONITOR_SERVER_PUBLIC}', authJwt: true, crossbarJwt: false},
        FIREBASE_API: {url: 'https://onesignal.com', authJwt: false, crossbarJwt: false},
        METABASE_API: {url: '${METABASE_SERVICE_PUBLIC}', authJwt: false, crossbarJwt: false},
        HAPPY_CALL_SERVICE_API: {url: '${HAPPY_CALL_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        SCORE_SERVICE_API: {url: '${SCORE_SERVICE_PUBLIC}', authJwt: false, crossbarJwt: false},
    }
    /*================================================================================================================*/

    const LOCAL_SERVICES = {
        PIVOT_SERVICE_API: {url: '${PIVOT_SERVICE_LOCAL}', authJwt: true, crossbarJwt: false}
    }
    /*================================================================================================================*/
    const ZONE_ALIAS = {
        HN: 'hn',
        HCM: 'hcm',
    };
    /*--------------------------------------------------------------APPLICATION PARAM-----------------------------------------------*/
    const PROPERTIES = {
        NUMBER_MESSAGE: 20, //số lượng tin nhắn trong 1 trang khi load cho phần lịch sử tin nhắn
        DEFAULT_FILE_SIZE: 20, // Dung lượng file size mặc định nếu cấu hình không định nghĩa (mb)
        MAXIMUM_TICKET: 5,
        MAXIMUM_MESSAGE: 20,
        MAXIMUM_NOTI: 10,
        TYPING_OFF: 5, // s
        NOTI_NEW_TICKET_TIME: 10,
        CHECK_STATUS_INTERVAL: 10, //phut
    }

    const REPORT_PROPERTIES = {
        TICKET_REPORT_ID: '${TICKET_REPORT_ID}',
        CHAT_REPORT_ID: '${CHAT_REPORT_ID}',
        FB_REPORT_ID: '${FB_REPORT_ID}',
        EMAIL_REPORT_ID: '${EMAIL_REPORT_ID}',
        DAILY_AGENT_STATUS_REPORT_ID: '${DAILY_AGENT_STATUS_REPORT_ID}',
        HOURLY_AGENT_STATUS_REPORT_ID: '${HOURLY_AGENT_STATUS_REPORT_ID}',
        INBOUND_AGENT_PRODUCTIVITY_REPORT_ID: '${INBOUND_AGENT_PRODUCTIVITY_REPORT_ID}',
        OUTBOUND_AGENT_PRODUCTIVITY_REPORT_ID: '${OUTBOUND_AGENT_PRODUCTIVITY_REPORT_ID}',
        CONNECT_VOICE_REPORT_ID: '${CONNECT_VOICE_REPORT_ID}',
        DAILY_AGENT_STATUS_RATIO_IN_QUEUE_GRAPH_ID: '${DAILY_AGENT_STATUS_RATIO_IN_QUEUE_GRAPH_ID}',
        DAILY_AGENT_CALL_STAT_DASHBOARD_ID: '${DAILY_AGENT_CALL_STAT_DASHBOARD_ID}',
        DAILY_AGENT_CALL_STAT_STATUS_DASHBOARD_ID: '${DAILY_AGENT_CALL_STAT_STATUS_DASHBOARD_ID}',
        DAILY_QUEUE_SOCIAL_STAT_STATUS_DASHBOARD_ID: '${DAILY_QUEUE_SOCIAL_STAT_STATUS_DASHBOARD_ID}',
        DAILY_AGENT_SOCIAL_STAT_STATUS_DASHBOARD_ID: '${DAILY_AGENT_SOCIAL_STAT_STATUS_DASHBOARD_ID}',
        AGENT_SOCIAL_PREDICTIVE_STAT_STATUS_DASHBOARD_ID: '${AGENT_SOCIAL_PREDICTIVE_STAT_STATUS_DASHBOARD_ID}',
        DAILY_AGENT_STATUS_PIE_CHART_ID: '${DAILY_AGENT_STATUS_PIE_CHART_ID}',
        DAILY_TICKET_AGENT_STATUS_PIE_CHART_ID: '${DAILY_TICKET_AGENT_STATUS_PIE_CHART_ID}',
        DAILY_CHAT_AGENT_STATUS_PIE_CHART_ID: '${DAILY_CHAT_AGENT_STATUS_PIE_CHART_ID}',
        REPORT_SECRET_KEY: '${REPORT_SECRET_KEY}'
    }

    const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

    window.env.production = true;
    window.env.KEYCLOAK = KEYCLOAK;
    window.env.SERVICES = SERVICES;
    window.env.LOCAL_SERVICES = LOCAL_SERVICES;
    window.env.WEB_PHONE = WEB_PHONE;
    window.env.WEB_DOMAIN_URL = WEB_DOMAIN_URL;
    window.env.DEFAULT_TIMEZONE = DEFAULT_TIMEZONE;
    window.env.PROPERTIES = PROPERTIES;
    window.env.REPORT_PROPERTIES = REPORT_PROPERTIES;
    window.env.BCCS_URL = BCCS_URL;
    window.env.ZALO_AUTH_URL = ZALO_AUTH_URL;
    window.env.ZALO_CALLBACK = ZALO_CALLBACK;
    window.env.ZONE_ALIAS = ZONE_ALIAS;

    console.log("===========================AGENT_WEB_PROFILE===========================");
    console.log("PROFILE " + PROFILE + ", ENV: ", window.env);
    console.log("=======================================================================");
}(this));
