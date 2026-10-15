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
    const ZALO_CALLBACK="${ZALO_CALLBACK}"

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
        CALL_BACK_SERVICE_API: {url: '${CALLBACK_SERVICE_PUBLIC}', authJwt: true, crossbarJwt: false},
        BOT_SERVER_API: {url: '${BOT_SERVER_PUBLIC}', authJwt: true, crossbarJwt: false},
        CALL_BOT_SERVICE_API: {url: 'https://171.226.10.112/predict', authJwt: false, crossbarJwt: false},
        CORE_SERVICE_API: {url: 'https://demo.moj.gov.vn:8100/core-service', authJwt: true, crossbarJwt: false},
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

    /*--------------------------------------------------------------APPLICATION PARAM-----------------------------------------------*/
    const CALL_BOT = {
        CHANNEL_ID: '${CALL_BOT_CHANNEL_ID}',
        SOURCE_ID: '${CALL_BOT_SOURCE_ID}'
    }
    const WHATSAPP = {
        WHATSAPP_APP_ID: '${WHATSAPP_APP_ID}',
        WHATSAPP_CONFIG_ID: '${WHATSAPP_CONFIG_ID}',
        WHATSAPP_REDIRECT_URI: '${WHATSAPP_REDIRECT_URI}'
    }
    const REPORT_PROPERTIES = {
        TICKET_REPORT_ID: '${TICKET_REPORT_ID}',
        FB_AD_REPORT_ID: '${FB_AD_REPORT_ID}',
        AG_STATUS_ABNORMAL_REPORT_ID: '${AG_STATUS_ABNORMAL_REPORT_ID}',
        KH_REPORT_ID: '${KH_REPORT_ID}',
        CHAT_REPORT_ID: '${CHAT_REPORT_ID}',
        FB_REPORT_ID: '${FB_REPORT_ID}',
        EMAIL_REPORT_ID: '${EMAIL_REPORT_ID}',
        TICKET_REPORT_ID_2: '${TICKET_REPORT_ID_2}',
        CHAT_REPORT_ID_2: '${CHAT_REPORT_ID_2}',
        FB_REPORT_ID_2: '${FB_REPORT_ID_2}',
        EMAIL_REPORT_ID_2: '${EMAIL_REPORT_ID_2}',
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
        REPORT_KEYWORD_WARNING: '${REPORT_KEYWORD_WARNING}',
        REPORT_SLA_CHAT: '${REPORT_SLA_CHAT}',
        REPORT_CALL_BACK: '${REPORT_CALL_BACK}',
        REPORT_ALLOCATION_SUM: '${REPORT_ALLOCATION_SUM}',
        REPORT_ALLOCATION_DETAIL: '${REPORT_ALLOCATION_DETAIL}',
        REPORT_CATEGORIES_DETAIL: '${REPORT_CATEGORIES_DETAIL}',
        REPORT_LOG_USER: '${REPORT_LOG_USER}',
        REPORT_SECRET_KEY: '${REPORT_SECRET_KEY}'
    }

    const FACEBOOK_PROPERTIES = {
        FB_APP_ID: '${FB_APP_ID}'
    }

    const DEFAULT_TIMEZONE = 'Asia/Ho_Chi_Minh';

    const AGENTMATE = {
        loaderUrl: '${AGENTMATE_LOADER_URL}',
        linkUrl: '${AGENTMATE_LINK_URL}',
        bubbleBackgroundColor: '#EF2732',
        bubbleColor: '#FFFFFF',
        bubbleContent: '${AGENTMATE_CHATBOT_IMAGE_URL}',
        bubblePadding: '1px',
        bubbleBorderRadius: '50%',

        widgetBackgroundColor: '#fff',
        widgetHeaderBackgroundColor: '#EF2732',
        widgetColor: '#ffffff',
        contentImg: '${AGENTMATE_CHATBOT_IMAGE_URL}',
        contentText: 'Trợ lý ảo Agent Mate',
        chatTextSize: '15px',
        chatLineHeight: '',

        assistantBackground: '#d4d4d4',
        assistantColor: '#000000',
        assistantAvatar: '${AGENTMATE_CHATBOT_IMAGE_URL}',
        userBackground: '#EF2732',
        userColor: '#FFFFFF',

        poweredBy: 'VCX',
        poweredByColor: '#EF2732',
        bots: [
          { key: '198', label: 'Trợ lý tra cứu đài 198', botId: '${AGENTMATE_BOT_ID_198}', contentText: 'Trợ lý ảo 198' },
          { key: 'knowxhub', label: 'Trợ lý tra cứu đài KnownX Hub', botId: '${AGENTMATE_BOT_ID_KNOWNXHUB}', contentText: 'Trợ lý ảo KnowxHub' },
        ],
        autoOpenWidget: 'false'
    }

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
    window.env.FACEBOOK_PROPERTIES = FACEBOOK_PROPERTIES;
    window.env.CALL_BOT = CALL_BOT;
    window.env.AGENTMATE = AGENTMATE;
    window.env.WHATSAPP = WHATSAPP;

    console.log("===========================AGENT_WEB_PROFILE===========================");
    console.log("PROFILE " + PROFILE + ", ENV: ", window.env);
    console.log("=======================================================================");
}(this));
