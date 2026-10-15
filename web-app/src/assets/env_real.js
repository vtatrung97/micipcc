(function (window) {
    window.env = window.env || {};

    const PROFILE = "IPCC2_DEV";

    /*================================================================================================================*/
    const KEYCLOAK = {
        endpoint: 'https://cc.vietteltelecom.vn:8443',
        requireHttps: false,
        showDebugInformation: false,
        strictDiscoveryDocumentValidation: false
    };
    /*================================================================================================================*/
    const SCHEMA = 'http://';
    const API_GW = 'api.10.60.158.94.nip.io:8100';
    const WEB_PHONE = 'https://demo.unitel.com.la:9976/webphone"';
    const WEB_DOMAIN_URL = 'http://10.60.156.127:8888';
    const BCCS_URL = "https://10.240.147.246/BCCS_CC/home";
    const ZALO_AUTH_URL = "https://oauth.zaloapp.com/v4";
    const ZALO_CALLBACK = "https://cc.vietteltelecom.vn/chat-service/public/api/v1/zalo-accounts/callback"

    const SERVICES = {
        CROSSBAR: {url: 'https://cc.vietteltelecom.vn/hni6-kapps', authJwt: false, crossbarJwt: true},
        ACCOUNT_API: {url: 'https://cc.vietteltelecom.vn/account-server', authJwt: true, crossbarJwt: false},
        ACD_SERVICE_API: {url: 'https://cc.vietteltelecom.vn/acd-service', authJwt: true, crossbarJwt: false},
        CHAT_SERVER_API: {url: 'https://cc.vietteltelecom.vn/chat-server', authJwt: true, crossbarJwt: false},
        AGENT_SERVER_API: {url: 'https://cc.vietteltelecom.vn/agent-server', authJwt: true, crossbarJwt: false},
        AGENT_NOTIFY_SERVER_API: {url: 'https://cc.vietteltelecom.vn/agent-notify-server', authJwt: true, crossbarJwt: false},
        NOTIFICATION_SERVER_API: {url: 'https://cc.vietteltelecom.vn/notification-server', authJwt: true, crossbarJwt: false},
        CHAT_SERVICE_API: {url: 'https://cc.vietteltelecom.vn/chat-service', authJwt: true, crossbarJwt: false},
        EMAIL_SERVICE_API: {url: 'https://cc.vietteltelecom.vn/email-service', authJwt: true, crossbarJwt: false},
        TICKET_SERVICE_API: {url: 'https://cc.vietteltelecom.vn/ticket-service', authJwt: true, crossbarJwt: false},
        EMAIL_GATEWAY_SERVICE_API: {url: 'https://cc.vietteltelecom.vn/email-gateway', authJwt: true, crossbarJwt: false},
        SOCIAL_GATEWAY_SERVICE_API: {url: 'https://cc.vietteltelecom.vn/social-gateway', authJwt: true, crossbarJwt: false},
        CAMPAIGN_SERVICE_API: {url: 'https://cc.vietteltelecom.vn/campaign-service', authJwt: true, crossbarJwt: false},
        CCMS_SERVICE_API: {url: 'https://cc.vietteltelecom.vn/ccms-service', authJwt: true, crossbarJwt: false},
        SERVICE_PIVOT_API: {url: 'https://cc.vietteltelecom.vn/service-pivot', authJwt: true, crossbarJwt: false},
        REPORT_SERVICE_API: {url: 'https://cc.vietteltelecom.vn/service-report', authJwt: true, crossbarJwt: false},
        QUALITY_SERVICE_API: {url: 'https://cc.vietteltelecom.vn/quality-service', authJwt: true, crossbarJwt: false},
        MONITOR_SERVER_API: {url: 'https://cc.vietteltelecom.vn/monitor-server', authJwt: true, crossbarJwt: false},
        FIREBASE_API: {url: 'https://onesignal.com', authJwt: false, crossbarJwt: false},
        METABASE_API: {url: 'https://cc.vietteltelecom.vn/metabase', authJwt: false, crossbarJwt: false},
        HAPPY_CALL_SERVICE_API: {url: 'https://cc.vietteltelecom.vn/happy-call-service', authJwt: true, crossbarJwt: false},
        CALL_BACK_SERVICE_API: {url: 'https://demo.moj.gov.vn:8100/callback-service', authJwt: true, crossbarJwt: false},
        CORE_SERVICE_API: {url: 'https://demo.moj.gov.vn:8100/core-service', authJwt: true, crossbarJwt: false},
    }

    const LOCAL_SERVICES = {
        PIVOT_SERVICE_API: {url: 'http://pivot-service:9999', authJwt: false, crossbarJwt: false}
    }
    const CALL_BOT = {
        CHANNEL_ID: '3,5',
        SOURCE_ID: '0b04b024-556e-4a1a-98c8-0ad6090cba91,1901,f5265605-d8f9-4bf1-8f81-632cb1e780f5,3fb77829-4806-11f0-b7dd-005056b04b77'
    }
    const ZONE_ALIAS = {
        HN: 'hn',
        HCM: 'hcm',
    };

    const WHATSAPP = {
        WHATSAPP_APP_ID: '${WHATSAPP_APP_ID}',
        WHATSAPP_CONFIG_ID: '${WHATSAPP_CONFIG_ID}',
        WHATSAPP_REDIRECT_URI: '${WHATSAPP_REDIRECT_URI}'
    }

    /*--------------------------------------------------------------APPLICATION PARAM-----------------------------------------------*/
    const PROPERTIES = {
        NUMBER_MESSAGE: 20, //số lượng tin nhắn trong 1 trang khi load cho phần lịch sử tin nhắn
        DEFAULT_FILE_SIZE: 20, // Dung lượng file size mặc định nếu cấu hình không định nghĩa (mb)
        MAXIMUM_TICKET: 5,
        MAXIMUM_MESSAGE: 20,
        MAXIMUM_NOTI: 10,
        TYPING_OFF: 5, // s
        NOTI_NEW_TICKET_TIME: 10,
        WHITELIST_CONFIG_SIZE: 1, //MB,
        CHECK_STATUS_INTERVAL: 10, //phut
    }

    const REPORT_PROPERTIES = {
        TICKET_REPORT_ID: '14',
        CHAT_REPORT_ID: '15',
        FB_REPORT_ID: '16',
        FB_AD_REPORT_ID: '155',
        AG_STATUS_ABNORMAL_REPORT_ID: '199',
        EMAIL_REPORT_ID: '17',
        KH_REPORT_ID: '150',

        // biến v2 sử dụng ở cách màn nâng cấp của bc
        TICKET_REPORT_ID_2: '14',
        CHAT_REPORT_ID_2: '15',
        FB_REPORT_ID_2: '16',
        EMAIL_REPORT_ID_2: '17',

        DAILY_AGENT_STATUS_REPORT_ID: '1',
        HOURLY_AGENT_STATUS_REPORT_ID: '8',
        INBOUND_AGENT_PRODUCTIVITY_REPORT_ID: '2',
        OUTBOUND_AGENT_PRODUCTIVITY_REPORT_ID: '9',
        CONNECT_VOICE_REPORT_ID: '7',
        DAILY_AGENT_STATUS_RATIO_IN_QUEUE_GRAPH_ID: '24',
        DAILY_AGENT_CALL_STAT_DASHBOARD_ID: '7',
        DAILY_AGENT_CALL_STAT_STATUS_DASHBOARD_ID: '8',
        DAILY_QUEUE_SOCIAL_STAT_STATUS_DASHBOARD_ID: '9',
        DAILY_AGENT_SOCIAL_STAT_STATUS_DASHBOARD_ID: '10',
        AGENT_SOCIAL_PREDICTIVE_STAT_STATUS_DASHBOARD_ID: '11',
        DAILY_AGENT_STATUS_PIE_CHART_ID: '22',
        DAILY_TICKET_AGENT_STATUS_PIE_CHART_ID: '88',
        DAILY_CHAT_AGENT_STATUS_PIE_CHART_ID: '89',

        REPORT_SECRET_KEY: '8a1f80782fc23f56b77447671662c0e903e83d47e439d576bb36251f926412de'
    }

    const AGENTMATE = {
        loaderUrl: "https://agentmate.knowxhub.com:8443/assets/loader/loader.min.js",
        linkUrl: 'https://agentmate.knowxhub.com:8443',
        bubbleBackgroundColor: '#EF2732',
        bubbleColor: '#FFFFFF',
        bubbleContent: 'https://cc.vietteltelecom.vn/assets/images/chatbot.png',
        bubblePadding: '1px',
        bubbleBorderRadius: '50%',

        widgetBackgroundColor: '#fff',
        widgetHeaderBackgroundColor: '#EF2732',
        widgetColor: '#ffffff',
        contentImg: 'https://cc.vietteltelecom.vn/assets/images/chatbot.png',
        contentText: 'Trợ lý ảo Agent Mate',
        chatTextSize: '15px',
        chatLineHeight: '',

        assistantBackground: '#d4d4d4',
        assistantColor: '#000000',
        assistantAvatar: 'https://cc.vietteltelecom.vn/assets/images/chatbot.png',
        userBackground: '#EF2732',
        userColor: '#FFFFFF',

        poweredBy: 'VCX',
        poweredByColor: '#EF2732',
        bots: [
          { key: '198', label: 'Trợ lý tra cứu đài 198', botId: '2f896219-4425-437d-9e83-f21f7b788ff6', contentText: 'Trợ lý ảo 198' },
          { key: 'knowxhub', label: 'Trợ lý tra cứu đài KnownX Hub', botId: 'c03b37aa-3970-44b6-8ab2-2e5937a5063b', contentText: 'Trợ lý ảo KnowxHub' },
        ],
        autoOpenWidget: 'false'
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
    window.env.CALL_BOT = CALL_BOT;
    window.env.AGENTMATE = AGENTMATE;
    window.env.WHATSAPP = WHATSAPP;


    console.log("===========================AGENT_WEB_PROFILE===========================");
    console.log("PROFILE " + PROFILE + ", ENV: ", window.env);
    console.log("=======================================================================");
}(this));
