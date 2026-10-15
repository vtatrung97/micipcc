export const CALLFLOW = {
    ACCOUNT_MAIN_CALLFLOW_NAME: 'MainCallflow',

    MAIN_CALLFLOWS: ['MainOpenHours', 'MainLunchHours', 'MainAfterHours', 'MainHolidays'], //'MainOpenHoursMenu', 'MainLunchHoursMenu', 'MainAfterHoursMenu', 'MainHolidaysMenu'],
    MAIN_OPEN_HOURS: 'MainOpenHours',
    MAIN_LUNCH_HOURS: 'MainLunchHours',
    MAIN_AFTER_HOURS: 'MainAfterHours',
    MAIN_HOLIDAYS: 'MainHolidays',
    // MAIN_OPEN_HOURS_MENU: 'MainOpenHoursMenu', MAIN_LUNCH_HOURS_MENU: 'MainLunchHoursMenu', MAIN_AFTER_HOURS_MENU: 'MainAfterHoursMenu', MAIN_HOLIDAYS_MENU: 'MainHolidaysMenu',

    USER_CALLFLOW_TYPE: 'mainUserCallflow',

    TEMPORAL_RULE_TYPE: {
        MAIN_WEEKDAYS: 'main_weekdays',
        MAIN_LUNCHBREAK: 'main_lunchbreak',
        MAIN_HOLIDAYS: 'main_holidays'
    },
    MAIN_WEEKDAYS_TEMPORAL_RULE_NAME: {
        MAIN_MONDAY: 'MainMonday',
        MAIN_TUESDAY: 'MainTuesday',
        MAIN_WEDNESDAY: 'MainWednesday',
        MAIN_THURSDAY: 'MainThursday',
        MAIN_FRIDAY: 'MainFriday',
        MAIN_SATURDAY: 'MainSaturday',
        MAIN_SUNDAY: 'MainSunday'
    },
    MODULE_TYPE: {
        ACDC_MEMBER: 'acdc_member',
        COLLECT_DTMF: 'collect_dtmf',
        RING_GROUP: 'ring_group',
        CALLFLOW: 'callflow',
        DEVICE: 'device',
        MENU: 'menu',
        LANGUAGE: 'language',
        PLAY: 'play',
        PIVOT: 'pivot',
        PIVOT_VARIABLE: 'pivot_variable',
        PIVOT_VIP_CHECK: 'pivot_vip_check',
        TEMPORAL_ROUTE: 'temporal_route',
        USER: 'user',
        VOICEMAIL: 'voicemail',
        BRANCH_VARIABLE: 'branch_variable',
    }
};

export const DEFAULT_ACCOUNT_LIMITS = {
    version: "cbcc-20181131",
    id: "limits",
    allow_prepay: true,
    inbound_trunks: 1,
    outbound_trunks: 1,
    twoway_trunks: 1
};

export const DEFAULT_ACCOUNT_TOKEN_RESTRICTIONS = {
    "version": "cbcc-202006",
    "restrictions": {
        "_": {
            "admin": {
                "_": [
                    {
                        'rules': {
                            '#': ['_']
                        }
                    }
                ]
            },
            "user": {
                "token_auth": [
                    {
                        "rules": {
                            "#": [
                                "GET"
                            ]
                        }
                    }
                ],
                "auth": [
                    {
                        "rules": {
                            "#": ["PUT"]
                        }
                    }
                ],
                "accounts": [{ "rules": { "#": ["GET"] } }],
                "agents": [
                    {
                        'rules': {
                            '/': ['GET'],
                            'status': ['GET'],
                            '*/status': ['GET', 'POST'],
                            '*': ['GET']
                        }
                    }
                ],
                'users': [
                    {
                        'rules': {
                            '#': [
                                'GET'
                            ]
                        },
                        'devices': {
                            'rules': {
                                '#': [
                                    'GET'
                                ]
                            },
                            '_': {
                                'rules': {
                                    '#': []
                                }
                            }
                        }
                    }
                ],
                "callflows": [{ "rules": { "#": ["GET"] } }],
                "devices": [{ "rules": { "#": ["GET"] } }],
                "media": [{ "rules": { "#": ["GET"] } }],
                "queues": [
                    {
                        "rules": {
                            "eavesdrop": ["PUT"],
                            "#": ["GET", "POST"]
                        }
                    }
                ],
                "recordings": [{ "rules": { "#": ["GET"] } }],
                "channels": [{ "rules": { "*": ["POST"] } }],
                "_": [{ "rules": { "#": [] } }]
            }
        }
    }
};

export const MENU = {
    MAIN_MENUS: ['MainOpenHoursMenu', 'MainLunchHoursMenu', 'MainAfterHoursMenu', 'MainHolidaysMenu'],
    MAIN_OPEN_HOURS_MENU: 'MainOpenHoursMenu',
    MAIN_LUNCH_HOURS_MENU: 'MainLunchHoursMenu',
    MAIN_AFTER_HOURS_MENU: 'MainAfterHoursMenu',
    MAIN_HOLIDAYS_MENU: 'MainHolidaysMenu',
    FACEBOOK_PAGE_MENU: 'FACEBOOK_PAGE_MENU',
    STICKER_MENU: 'STICKER_MENU',
    GIFT_MENU: 'GIFT_MENU',
    AUTOMATION_TICKET_MENU: 'AUTOMATION_TICKET_MENU',
    COLOR_CHAT_SETTINGS_MENU: "COLOR_CHAT_SETTINGS_MENU",
    SHIFT_MENU: "SHIFT_MENU",
    TEMPLATE_ANSWER_MENU: "TEMPLATE_ANSWER_MENU",
    SHIFT_REGISTER_MENU: "SHIFT_REGISTER_MENU",
    REPORT_GENERAL_DAILY: "REPORT_GENERAL_DAILY",
    REPORT_AGENT_PRODUCTIVITY: "REPORT_AGENT_PRODUCTIVITY",
    REPORT_TICKET_STATISTICS: "REPORT_TICKET_STATISTICS",
    REPORT_FACEBOOK_CONNECTION: "REPORT_FACEBOOK_CONNECTION",
    REPORT_AGENT_CHAT: "REPORT_AGENT_CHAT",
    REPORT_IVR: "REPORT_IVR",
    REPORT_IVR_DAILY: "REPORT_IVR_DAILY",
    DOMAIN_SURVEY: "DOMAIN_SURVEY",
    FACEBOOK_CONFIGURE_MISS_MESSAGE: "FACEBOOK_CONFIGURE_MISS_MESSAGE",
    FACEBOOK_SURVEY: "FACEBOOK_SURVEY",
    CRM_MENU: "CRM_MENU",
    MANAGE_KNOWLEGDE_MENU: "MANAGE_KNOWLEGDE_MENU",
    SETTING_BILLING: "SETTING_BILLING",
    SETTING_TICKET_SLA: "SETTING_TICKET_SLA",
    REPORT_SYNTHESIS: "REPORT_SYNTHESIS",
    EMOJI: "EMOJI",
    HIERARCHY_TICKET: "HIERARCHY_TICKET",
    ACTIVE_TICKET: "ACTIVE_TICKET",
    TICKET_TYPE: "TICKET_TYPE"
};

export const REASON_TYPE = {
    DELETE: 1,
    HIDE: 2,
    IGNORED: 3
}

export const USER = {
    PRIV_LEVEL: {
        ADMIN: 'admin',
        USER: 'user'
    },
    USER_ROLE: {
        ADMIN: 'admin',
        SUPERVISOR: 'supervisor',
        AGENT: 'agent',
        IPCC_ADMIN: 'ipcc_admin',
        IPCC_SUPERVISOR: 'ipcc_supervisor',
        IPCC_AGENT: 'ipcc_agent',
        cc: {
            ipccv2_ultimate_admin: "ipccv2_ultimate_admin"
        }
    }
};

export const END_REASON = {
    AGENT_END: 1,
    CUSTOMER_TIMEOUT: 2,
    MISSED_ASSIGN_TIMEOUT: 3,
    MISSED_ASSIGN_NEWER: 4,
    BLOCKED: 5,
    CLOSED: 6
}

export const SOCIAL_STATUS = {
    ACTIVE: 1,
    REMOVE: 0,
    HIDE: 2
}

export const WEBPHONE_ACTION = {
    ACCEPT: 1,
    DENY: 2,
    HOLD: 3,
    UNHOLD: 4,
    MUTE: 5,
    UNMUTE: 6,
    OFF_CAMERA: 7,
    ON_CAMERA: 8,
    TRANSFER: 9
};

export const CHANNEL_MUTE = {
    MUTE_CAMERA: 'CHANNEL_MUTE_CAMERA',
    UNMUTE_CAMERA: 'CHANNEL_UNMUTE_CAMERA',
    MUTE_MICRO: 'CHANNEL_MUTE_MICRO',
    UNMUTE_MICRO: 'CHANNEL_UNMUTE_MICRO'
}

export const FB_ACTION = {
    PUBLISH_COMMENT: 1,
    CHANGE_STATUS: 2,
    CHANGE_LIKE: 3,
    UPDATE_COMMENT: 4
}

export const ADD_AGENT = {
    SYSTEM: 1,
    FILE: 2,
}

export const SIGNATURE_ACTION = {
    TRUE: 1,
    FALSE: 0,
}

export enum KpiParam {
    KPI_EMAIL_MAX_UPLOAD_SIZE = 12,
    KPI_EMAIL_UPLOAD_FORMAT = 13,
    KpiHoldNum= 5,
    KpiHoldTime= 6,
    KpiHoldTimeWaring=7 ,
    KpiFirstChatResponse = 8,
    KpiFirstChatResponseWarning = 9,
    KpiNextChatResponse = 10,
    KpiNextChatResponseWarning = 11,
}


export const emojiZalo = [{text:":)", emoji:"🙂"},{text:":~", emoji:"🥴"},{text:":b", emoji:"😍"},{text:":|", emoji:"😳"},
    {text:":z", emoji:"😴"},{text: "8-)", emoji: "😎"},{text: ":((", emoji: "😢"},{text: ":-|", emoji: "🥵"},{text: ":-h", emoji: "😡"},
    {text: ":+", emoji: "😎"},{text: "--b", emoji: "😅"},{text: ":q", emoji: "😣"},{text: ":t", emoji: "🤮"},{text: ";g", emoji: "😋"},
    {text: "|-)", emoji: "😌"},{text: ":!", emoji: "🥵"},{text: ":l", emoji: "😢"},{text: ";?", emoji: "😢"},{text: ";-x", emoji: "😦"},
    {text: ":-f", emoji: "😵"},{text: ";8", emoji: "😢"},{text: ":wipe", emoji: "🤫"},{text: ":-dig", emoji: "🥱"},{text: ":handclap", emoji: "😯"},
    {text: "&-(", emoji: "😯"},{text: ">-|", emoji: "🤗"},{text: "p-(", emoji: "🤗"},{text: ":--|", emoji: "😩"},{text: "x-)", emoji: "😁"},
    {text: "/-rose", emoji: "🌹"},{text: "/-fade", emoji: "🥀"},{text: "/-heart", emoji: "💗"},{text: "/-break", emoji: "💔"},{text: "/-bd", emoji: "🔪"},
    {text: "/-shit", emoji: "💩"},{text: "/-strong", emoji: "👍"},{text: "/-weak", emoji: "👎"},{text: "/-punch", emoji: "👊"},{text: "/-bad", emoji: "🤟"},
    {text: "/-loveu", emoji: "🤟"},{text: "/-no", emoji: "🖕"},{text: ":-((", emoji: "😭"},{text: ":$", emoji: "🤑"},{text: ":x", emoji: "🤐"},
    {text: ":p", emoji: "😜"},{text: ":d", emoji: "😁"},{text: ":o", emoji: "😲"},{text: ":(", emoji: "☹"},{text: ";p", emoji: "🙁"},{text: ";-d", emoji: "😚"},
    {text: ";d", emoji: "😗"},{text: ";o", emoji: "🤔"},{text: ":>", emoji: "😄"},{text: ":;", emoji: "😎"},{text: ";f", emoji: "😡"},{text: ";-s", emoji: "😢"},
    {text: ";!", emoji: "😤"},{text: ";-!", emoji: "💀"},{text: ";xx", emoji: "🥴"},{text: ":-bye", emoji: "👋"},{text: "b-)", emoji: "😁"},{text: ":-l", emoji: "😒"},
    {text: ":-r", emoji: "😚"},{text: ":-o", emoji: "🥱"},{text: ":*", emoji: "😗"},{text: ";-a", emoji: "😲"},{text: "8*", emoji: "🥺"},{text: "/-showlove", emoji: "🤗"},
    {text: "/-coffee", emoji: "☕"},{text: "/-cake", emoji: "🎂"},{text: "/-li", emoji: "⚡"},{text: "/-bome", emoji: "💣"},{text: "/-share", emoji: "🤝"},
    {text: "/-v", emoji: "✌"},{text: "/-thanks", emoji: "🙏"},{text: "/-jj", emoji: "👉"},{text: "/-oke", emoji: "👌"},{text: "/-flag", emoji: "🇻🇳"},{text: ":')", emoji: "😂"},
    {text: ":3", emoji: "😊"},{text: ";-)", emoji: "😊"},{text: ":))", emoji: "😎"},{text: ":-*", emoji: "😘"},{text: ":-<", emoji: "😒"},{text: "8*)", emoji: "😳"},
    {text: ";-/", emoji: "😞"},{text: "$-)", emoji: "🤑"},{text: "/-beer", emoji: "🍺"},{text: "/-ok", emoji: "👌"},{text: "_()_", emoji: "🙏"}]

export enum UnixTimeConstant {
    DEFAULT_TIME = 10000000000
}

export const SCOPE = {
    TICKET: {
        VIEW_ALL_TICKET: 'VIEW_ALL_TICKET',
        VIEW_TICKET_ASSIGNED: 'VIEW_TICKET_ASSIGNED',
        VIEW_TICKET_SUPERVISOR: 'VIEW_TICKET_SUPERVISOR',
        CLOSE_TICKET: 'close-ticket',
        CLOSE_MULTIPLE_TICKETS: 'close-multiple-ticket',
        ASSIGN_TICKET: 'ASSIGN_TICKET',
        UPDATE_TICKET: 'UPDATE_TICKET',
        UPDATE_ALL_TICKET: 'UPDATE_ALL_TICKET',
        UPDATE_TICKET_IN_MONITOR_QUEUE: 'UPDATE_TICKET_IN_MONITOR_QUEUE',
        UPDATE_TICKET_ASSIGNED: 'UPDATE_TICKET_ASSIGNED',
        IGNORE_ONE_TICKET_ASSIGNED: 'IGNORE_ONE_TICKET_ASSIGNED',
        IGNORE_ONE_TICKET_SUPERVISOR: 'IGNORE_ONE_TICKET_SUPERVISOR',
        IGNORE_TICKETS_ASSIGNED: 'IGNORE_TICKETS_ASSIGNED',
        IGNORE_TICKETS_SUPERVISOR: 'IGNORE_TICKETS_SUPERVISOR',
        TRANSFER_TICKETS_ASSIGNED: 'TRANSFER_TICKETS_ASSIGNED',
        TRANSFER_TICKETS_SUPERVISOR: 'TRANSFER_TICKETS_SUPERVISOR',
        VIEW_CUSTOMER_WITHOUT_ENCODE: 'VIEW_CUSTOMER_WITHOUT_ENCODE',
        MONITOR_ALL_TICKET: 'MONITOR_ALL_TICKET',
        MONITOR_TICKET_SUPERVISOR: 'MONITOR_TICKET_SUPERVISOR',
        UPDATE_CALLBOT_GROUP_CUSTOMER: 'UPDATE_CALLBOT_GROUP_CUSTOMER',
        VIEW_TICKET_NOTES_SUPERVISOR: 'VIEW_TICKET_NOTES_SUPERVISOR',
        SEARCH_WHITELIST: 'SEARCH_WHITELIST',
        CREATE_WHITELIST: 'CREATE_WHITELIST',
        DELETE_WHITELIST: 'DELETE_WHITELIST',
        IMPORT_WHITELIST: 'IMPORT_WHITELIST',
        VIEW_BLACKLIST: 'VIEW_BLACKLIST',
        ADD_BLACKLIST: 'ADD_BLACKLIST',
        UPDATE_BLACKLIST: 'UPDATE_BLACKLIST',
        DELETE_BLACKLIST: 'DELETE_BLACKLIST',
        IMPORT_BLACKLIST: 'IMPORT_BLACKLIST',
        SEARCH_AUTO_BLOCK: 'SEARCH_AUTO_BLOCK',
        CREATE_AUTO_BLOCK: 'CREATE_AUTO_BLOCK',
        DELETE_AUTO_BLOCK: 'DELETE_AUTO_BLOCK',
        UPDATE_AUTO_BLOCK: 'UPDATE_AUTO_BLOCK',
        VIEW_CALL_RECORDING: 'VIEW_CALL_RECORDING'
    },
    QUEUE: {
        VIEW_ALL_QUEUE: 'VIEW_ALL_QUEUE',
        VIEW_QUEUE_SUPERVISOR: 'VIEW_QUEUE_SUPERVISOR',
        VIEW_QUEUE_SOCIAL_STAT_DASHBOARD: 'VIEW_QUEUE_SOCIAL_STAT_DASHBOARD'
    },
    VOICE_QUEUE: {
        SHOW_ALL_QUEUE: 'SHOW_ALL_QUEUE',
        SHOW_QUEUE_SUPERVISOR: 'SHOW_QUEUE_SUPERVISOR'
    },
    AGENT: {
        MONITOR_AGENT: 'MONITOR_AGENT',
        MONITOR_AGENT_ALL_GROUP: 'MONITOR_AGENT_ALL_GROUP',
        MONITOR_AGENT_QUEUE_SUPERVISOR: 'MONITOR_AGENT_QUEUE_SUPERVISOR'
    },
    "MENU": {
        VIEW_MENU: "VIEW_MENU",
        CONFIGURE_MENU: "CONFIGURE_MENU",
        ADD_MENU: "ADD_MENU",
        EDIT_MENU: "EDIT_MENU",
        DELETE_MENU: "DELETE_MENU"
    },
    "ROLE": {
        VIEW_ROLE: "VIEW_ROLE",
        VIEW_ROLE_BY_REALM: "VIEW_ROLE_BY_REALM",
        ASSIGN_MENU: "ASSIGN_MENU",
        ADD_CONFIG_ROLE: 'ADD_CONFIG_ROLE',
        EDIT_CONFIG_ROLE: 'EDIT_CONFIG_ROLE',
        DELETE_CONFIG_ROLE: 'DELETE_CONFIG_ROLE',
        VIEW_CONFIG_ROLE: 'VIEW_CONFIG_ROLE'
    },
    FACEBOOK_PAGE: {
        DELETE_OTHER_USER_PAGE_COMMENT: "DELETE_OTHER_USER_PAGE_COMMENT",
        EDIT_OTHER_USER_PAGE_COMMENT: "EDIT_OTHER_USER_PAGE_COMMENT"
    },
    CALLFLOW: {
        CALLFLOW_DELETE: 'CALLFLOW_DELETE',
        CALLFLOW_CREATE: 'CALLFLOW_CREATE',
        CALLFLOW_UPDATE: 'CALLFLOW_UPDATE'
    },
    EXPERT:{
         DELETE_EXPERT: 'DELETE_EXPERT',
         IMPORT_EXPERT: 'IMPORT_EXPERT',
         EXPORT_EXPERT: 'EXPORT_EXPERT',
         EDIT_EXPERT: 'EDIT_EXPERT',
         ADD_EXPERT: 'ADD_EXPERT',
         VIEW_EXPERT: 'SHOW_EXPERT'
    },
    SHIFT_QUEUE: {
        DELETE_QUEUE_SUPERVISOR: "DELETE_QUEUE_SUPERVISOR",
        IMPORT_QUEUE_SUPERVISOR: "IMPORT_QUEUE_SUPERVISOR",
        EXPORT_QUEUE_SUPERVISOR: "EXPORT_QUEUE_SUPERVISOR",
        EDIT_QUEUE_SUPERVISOR: "EDIT_QUEUE_SUPERVISOR",
        ADD_QUEUE_SUPERVISOR: "ADD_QUEUE_SUPERVISOR",
        VIEW_QUEUE_SUPERVISOR: "SHOW_QUEUE_SUPERVISOR",
    },
    SHIFT_LEADER: {
        DELETE_VOICE_CHANNEL_SUPERVISOR: "DELETE_VOICE_CHANNEL_SUPERVISOR",
        IMPORT_VOICE_CHANNEL_SUPERVISOR: "IMPORT_VOICE_CHANNEL_SUPERVISOR",
        EXPORT_VOICE_CHANNEL_SUPERVISOR: "EXPORT_VOICE_CHANNEL_SUPERVISOR",
        EDIT_VOICE_CHANNEL_SUPERVISOR: "EDIT_VOICE_CHANNEL_SUPERVISOR",
        ADD_VOICE_CHANNEL_SUPERVISOR: "ADD_VOICE_CHANNEL_SUPERVISOR",
        VIEW_VOICE_CHANNEL_SUPERVISOR: "SHOW_VOICE_CHANNEL_SUPERVISOR",
    },
    CALLBOT_ROUTING: {
        EXPORT_CALLBOT_ROUTING: "EXPORT_CALLBOT_ROUTING",
        EDIT_CALLBOT_ROUTING: "EDIT_CALLBOT_ROUTING",
        ADD_CALLBOT_ROUTING: "ADD_CALLBOT_ROUTING",
        DELETE_CALLBOT_ROUTING: "DELETE_CALLBOT_ROUTING",
        VIEW_CALLBOT_ROUTING: "SHOW_CALLBOT_ROUTING"
    },
    AREA: {
        DELETE_AREA: "DELETE_AREA",
        EXPORT_AGENT_TO_AREA: "EXPORT_AGENT_TO_AREA",
        ADD_AGENT_TO_AREA_BY_FILE: "ADD_AGENT_TO_AREA_BY_FILE",
        ADD_AGENT_TO_AREA: "ADD_AGENT_TO_AREA",
        DELETE_AGENT_TO_AREA: "DELETE_AGENT_TO_AREA",
        VIEW_AREA_LIST: "SHOW_AREA_LIST",
        EXPORT_AREA: "EXPORT_AREA",
        VIEW_ALL_AGENT_OF_AREA: "SHOW_ALL_AGENT_OF_AREA",
        UPDATE_AREA: "UPDATE_AREA",
        ADD_AREA: "ADD_AREA"
    },
    CCMS_SERVICE: {
        USER_INFO_OUTBOUND_ENCODED: 'USER_INFO_OUTBOUND_ENCODED',
        USER_INFO_INBOUND_ENCODED: 'USER_INFO_INBOUND_ENCODED',
        SHOW_WARNING_UNIT: 'SHOW_WARNING_UNIT'
    },
    ACD_SERVICE: {
        SEARCH_QUEUE_OMIMAP: 'SEARCH_QUEUE_OMIMAP',
        CREATE_QUEUE_OMIMAP: 'CREATE_QUEUE_OMIMAP',
        UPDATE_QUEUE_OMIMAP: 'UPDATE_QUEUE_OMIMAP',
        DELETE_QUEUE_OMIMAP: 'DELETE_QUEUE_OMIMAP',
    },
    VIEW_ALL_SCORE_RESULT: "VIEW_ALL_SCORE_RESULT",
    BOT_SERVER: {
        CREATE_CXBOT: 'CREATE_CXBOT',
        DELETE_CXBOT: 'DELETE_CXBOT',
        EDIT_CXBOT: 'EDIT_CXBOT',
        SEARCH_CXBOT: 'SEARCH_CXBOT',
        EXPORT_CXBOT: 'EXPORT_CXBOT'
    },
    HAPPY_CALL_SERVICE: {
        VIEW_REPORT_CAMPAIGN_CALLOUT: 'VIEW_REPORT_CAMPAIGN_CALLOUT',
        EXPORT_REPORT_CAMPAIGN_CALLOUT: 'EXPORT_REPORT_CAMPAIGN_CALLOUT'
    },
    CHAT_SERVER: {
        ADD_WARNING_NOTIFICATION: 'ADD_WARNING_NOTIFICATION'
    },
    ALERT_MULTI_CHANNEL: {
        ADD_ALERT_MULTI_CHANNEL: 'ADD_ALERT_MULTI_CHANNEL',
        EDIT_ALERT_MULTI_CHANNEL: 'EDIT_ALERT_MULTI_CHANNEL',
        DELETE_ALERT_MULTI_CHANNEL: 'DELETE_ALERT_MULTI_CHANNEL',
        VIEW_ALERT_MULTI_CHANNEL: 'VIEW_ALERT_MULTI_CHANNEL'
    },
    SERVICE_REPORT: {
        VIEW_REPORT_LOG_LOGIN_USER_ADMIN: 'VIEW_REPORT_LOG_LOGIN_USER_ADMIN',
        EXPORT_REPORT_LOG_LOGIN_USER_ADMIN: 'EXPORT_REPORT_LOG_LOGIN_USER_ADMIN'
    }
}

export const NOTIFICATION_TYPE = {
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
}

export const NOTIFICATION_CODE = {
    LOGGED_OUT_CAUSE_NO_ANSWER: "LOGGED_OUT_CAUSE_NO_ANSWER",
    CALL_INTERCEPTED_BY_SUPERVISOR: "CALL_INTERCEPTED_BY_SUPERVISOR",
    STATUS_CHANGED_BY_SUPERVISOR: "STATUS_CHANGED_BY_SUPERVISOR",
    CHAT_STATUS_CHANGED_BY_SUPERVISOR: "CHAT_STATUS_CHANGED_BY_SUPERVISOR",
};

export const EAVESDROP_MODE = {
    listen: 'listen',
    whisper: 'whisper',
    full: 'full'
};

export const CALL_SETTING_ROUTING = {
    BCCS: 'https://cc.vietteltelecom.vn/bccs/',
    CUSTOMER_CARE: 'https://cc.vietteltelecom.vn/customer-care/'
};

export const KAZOO = {
    UI_METADATA_VOIP: {
        origin: 'voip',
        ui: 'monster-ui',
        version: '4.1-63',
    }
};

export const KAZOO_MEDIA_TYPE = {
    MP3: 'audio/mp3',
    WAV: 'audio/wav',
    MP4: 'video/mp4'
};

export const SERVICE_PIVOT_GROUP_TYPE = {
    WSO2: 0,
    MUSIC_BY_AREA: 1,
    MUSIC_BY_RANK: 2,
    CHECK_GROUP: 3,
    COMMON_MUSIC: 4,
    CHECK_RANK: 5,
    CHECK_PHONE_TYPE_AND_RANK: 6,
    REDEEM_POINT: 7,
    CHECK_DEBIT_72H_MOBILE: 8,
    OPEN_PROVISIONAL_MOBILE: 9,
    CHECK_DEBIT_72H_FIXED: 10,
    OPEN_PROVISIONAL_FIXED: 11,
    MUSIC_BY_IVR_GROUP: 12,
    FORMAT_PHONE_NUMBER: 15,
    GENERAL: 0,
    CHECK_PACKAGE: 17
};

export const RatingMarkStatus = {
    UNMARKED: 0,
    SUPERVISOR_MARKED: 1,
    INSPECTOR_1_MARKED: 2,
    INSPECTOR_2_MARKED: 3,
    ADMIN_MARKED: 4,
    SUPERVISOR_MARKING: 5,
    INSPECTOR_1_MARKING: 6,
    INSPECTOR_2_MARKING: 7,
    ADMIN_MARKING: 8
}

class Status {
    status: string;
    color: string;
    disp: string;
    isShownFrequency: boolean;
    channel: string;
    constructor(channel: string,status: string, color: string, disp: string, isShownFrequency: boolean) {
        this.status = status;
        this.color = color;
        this.disp = disp;
        this.isShownFrequency = isShownFrequency;
        this.channel = channel;
    }
}
export const STATUSES: Status[] = [
    new Status('voice','logged_in','22c55e', 'monitor.voice.agentStatus.agent-available', true),
    new Status('voice','ready','22c55e', 'monitor.voice.agentStatus.agent-available', true),
    new Status('voice','resume','22c55e', 'monitor.voice.agentStatus.agent-available', true),
    new Status('voice','inbound','22c55e', 'monitor.voice.agentStatus.agent-available', true),
    new Status('voice',"inbound_connected", '22c55e', 'monitor.voice.agentStatus.agent-available-inbound-answering', false),
    new Status('voice',"outbound_connected", '22c55e', 'monitor.voice.agentStatus.agent-available-outbound-answering', false),
    new Status('voice','paused','83650D', 'paused', true),
    new Status('voice','wrapup','83650D', 'wrapup', true),
    new Status('voice','connecting','22c55e', 'onACall', true),
    new Status('voice','connected','22c55e', 'onACall', true),
    new Status('voice','logged_out','ef4444', 'monitor.voice.agentStatus.agent-logged-out', true),
    new Status('voice','web_exit', 'ef4444', 'monitor.voice.agentStatus.agent-logged-out', false),
    new Status('voice','unknown','191B1D', 'CUSTOMER.level-unknown-damn', true),
    new Status('voice','outbound','22c55e', 'agent.status.availableOutbound', true),
    new Status('voice','outbound_connecting','22c55e', 'agent.status.outboundConnecting', false),
    new Status('voice','outbound_connected','22c55e', 'agent.status.outboundConnected', false),
    new Status('voice','lunch','83650D', 'monitor.voice.agentStatus.agent-at-lunch', true),
    new Status('voice','meeting','AF8612', 'monitor.voice.agentStatus.agent-meeting', true),
    new Status('voice','no_acd','AF8612', 'agent.status.noAcd', true),
    new Status('voice','training','DBA816', 'agent.status.training', true),
    new Status('voice','not_available','ef4444', 'agent.status.notAvailable', true),
    new Status('voice','go_out','44494D', 'agent.status.goOut', true),
    new Status('voice','typing','D7814A', 'agent.status.typing', true),
    new Status('voice','sleeping','D66905', 'agent.status.sleep', true),
    new Status('voice','no_answer','191B1D', 'agent.status.noAnswer', true),
    new Status('voice','direct_call','191B1D', 'agent.status.directCall', true),
    new Status('chat','chat_at_lunch','83650D', 'agent.status.atLunch', true),
    new Status('chat','chat_meeting','83650D', 'agent.status.meeting', true),
    new Status('chat','chat_no_acd','AF8612', 'agent.status.noAcd', true),
    new Status('chat','chat_available','AF8612', 'agent.status.available', true),
    new Status('chat','chat_not_available','AF8612', 'agent.status.notAvailable', true),
    new Status('ticket','ticket_at_lunch','83650D', 'agent.status.atLunch', true),
    new Status('ticket','ticket_meeting','83650D', 'agent.status.meeting', true),
    new Status('ticket','ticket_no_acd','AF8612', 'agent.status.noAcd', true),
    new Status('ticket','ticket_available','AF8612', 'agent.status.available', true),
    new Status('ticket','ticket_not_available','AF8612', 'agent.status.notAvailable', true)

];

export const enumRecordStatus = [
    {
        label: 'Đã xóa',
        value: 0
    },
    {
        label: 'Đã lưu',
        value: 1
    },
    {
        label: 'Lưu nháp',
        value: 2
    },
]

export const EnumCampaignCode = {
    HPC: 1,
    TELESALES: 2,
    SELL_PACKAGE: 3
}
