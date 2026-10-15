// @ts-ignore
import {IdName} from "../id-name.model";

export class MenuSummary extends IdName {
}

export class MenuDetail {
    id: string;
    name: string;
    timeout: number = 10000;
    interdigit_timeout: number = 2000;
    max_extension_length: number = 4;
    media: {
        invalid_media: boolean;
        transfer_media: boolean;
        exit_media: boolean;
        greeting?: string;
    };
    allow_record_from_offnet: boolean;
    suppress_media: boolean;
    retries: number = 3;

    record_pin: string;
    type: string;

    hunt: boolean;
    hunt_allow: string;
    hunt_deny: string;

    constructor(obj?: { name?: string, type?: string }) {
        if (obj && obj.name) {
            this.name = obj.name;
        }
        if (obj && obj.type) {
            this.type = obj.type;
        }
        this.media = {invalid_media: true, transfer_media: true, exit_media: true};
    }
}

export const MENU = {
    MAIN_MENUS: ['MainOpenHoursMenu', 'MainLunchHoursMenu', 'MainAfterHoursMenu', 'MainHolidaysMenu'],
    MAIN_OPEN_HOURS_MENU: 'MainOpenHoursMenu',
    MAIN_LUNCH_HOURS_MENU: 'MainLunchHoursMenu',
    MAIN_AFTER_HOURS_MENU: 'MainAfterHoursMenu',
    MAIN_HOLIDAYS_MENU: 'MainHolidaysMenu',
    FACEBOOK_PAGE_MENU:'FACEBOOK_PAGE_MENU',
    STICKER_MENU:'STICKER_MENU',
    GIFT_MENU:'GIFT_MENU',
    AUTOMATION_TICKET_MENU:'AUTOMATION_TICKET_MENU',
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
    CRM_MENU : "CRM_MENU",
    MANAGE_KNOWLEGDE_MENU: "MANAGE_KNOWLEGDE_MENU",
    SETTING_BILLING: "SETTING_BILLING",
    SETTING_TICKET_SLA: "SETTING_TICKET_SLA",
    REPORT_SYNTHESIS: "REPORT_SYNTHESIS",
    EMOJI: "EMOJI"
};
