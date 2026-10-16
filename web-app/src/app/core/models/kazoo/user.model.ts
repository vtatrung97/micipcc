import {CallForwardParameters} from "./call-forward-parameters.model";
import {CallRecording} from "./call-recording.model";
import {KZ_PRIVILEGE_LEVEL} from "./common.model";

export class UserSummary {
    id?: string;
    name?: string;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    priv_level?: string;
    presence_id?: string;
    features?: any[];
}

export class UserDetail {
    id?: string;
    keycloakUserId: any;
    username: string;
    password?: string;
    email: string;
    first_name: string;
    last_name: string;
    priv_level: string;
    presence_id: string;
    apps: any;
    companyId: any;
    siteId: any;
    roleCode: any;
    call_forward?: CallForwardParameters;
    call_restriction?: {
        closed_groups: {
            action: string
        };
        tollfree_us: {
            action: string
        };
        toll_us: {
            action: string
        };
        emergency: {
            action: string
        };
        caribbean: {
            action: string
        };
        did_us: {
            action: string
        };
        international: {
            action: string
        };
        unknown: {
            action: string
        }
    };
    caller_id: {
        internal?: {
            name?: string;
            number?: string
        }
        external?: {
            name?: string;
            number?: string
        }
    };
    hotdesk?: {
        enabled: boolean;
        keep_logged_in_elsewhere: boolean;
        require_pin: boolean;
        id: string
    };
    contact_list?: {
        exclude: boolean
    };
    music_on_hold?: {
        media_id: string;
    };
    send_email_on_creation: boolean;
    dial_plan?: {};
    enabled: boolean = true;
    media?: {
        audio: any;
        encryption: {
            enforce_security: boolean;
            methods: any[]
        };
        video: {
            codecs: any[]
        }
    };
    profile: any;
    require_password_update?: boolean;
    ringtones: any;
    verified?: boolean;
    vm_to_email_enabled?: boolean;
    directories?: any;
    fax_to_email_enabled?: boolean;
    record_call?: boolean;
    account_name?: string;
    ui_help?: {
        myaccount: {
            showfirstUseWalkthrough: boolean
        };
        voip: {
            showDashboardWalkthrough: boolean;
            showUsersWalkthrough: boolean;
            showGroupsWalkthrough: boolean;
            showStrategyFirstWalkthrough: boolean;
            showStrategySecondWalkthrough: boolean
        }
    };
    appList?: string[];
    smartpbx?: {
        call_recording: {
            enabled: boolean
        }
    };
    call_recording?: CallRecording;
    maxChatTrans?: string;
    maxTicketTrans?: string;

    //them so dien thoai
    mobileNumber?: string;

    constructor(username: string, email: string, first_name: string, last_name: string, extension: string, companyId ?: any, siteId ?: any, roleCode ?: any, password?: string, keycloakUserId ?: any, priv_level?: string, send_email_on_creation?: boolean, mobileNumber?: string) {
        this.username = username;
        this.email = email;
        this.first_name = first_name;
        this.last_name = last_name;
        this.presence_id = extension;

        if (priv_level) {
            this.priv_level = priv_level;
        } else {
            this.priv_level = KZ_PRIVILEGE_LEVEL.user;
        }

        if (send_email_on_creation) {
            this.send_email_on_creation = send_email_on_creation;
        } else {
            this.send_email_on_creation = false;
        }

        if (password) {
            this.password = password;
        }
        if (keycloakUserId) {
            this.keycloakUserId = keycloakUserId;
        }
        if (companyId) {
            this.companyId = companyId;
        }
        if (siteId) {
            this.siteId = siteId;
        }
        if (roleCode) {
            this.roleCode = roleCode;
        }

        this.caller_id = {internal: {name: `${first_name} ${last_name}`, number: extension}};

        this.mobileNumber = mobileNumber;
    }
}
