import {CallForwardParameters} from "./call-forward-parameters.model";
import {CallRecording} from "./call-recording.model";

export enum DEVICE_TYPE {
    softphone = 'softphone', sip_device = 'sip_device', smartphone = 'smartphone', cellphone = 'cellphone', sip_uri = 'sip_uri'
}

export class DeviceSummary {
    id: string;
    name: string;
    username: string;
    mac_address: string;
    owner_id: string;
    enabled: boolean;
    device_type: string;

    constructor(id: string, name: string, username: string, mac_address: string, owner_id: string, enabled: boolean, device_type: string) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.mac_address = mac_address;
        this.owner_id = owner_id;
        this.enabled = enabled;
        this.device_type = device_type;
    }
}

export class SIPParams {
    username: any;
    password: any;
    expire_seconds: number | undefined;
    invite_format: string | undefined;
    method: string | undefined;
    ip: string | undefined;
    //static_route: string;
    route: any;
    number: string | undefined;
    realm: string | undefined;
    //ignore_completed_elsewhere: boolean;
    //custom_sip_headers: any;

    // IP Phone, Soft Phone, Smart phone
    static SIPPhoneDeviceSIPParams(username: any, password: any, expire_seconds?: number): SIPParams {
        const sip = new SIPParams();
        sip.username = username;
        sip.password = password;
        sip.expire_seconds = expire_seconds ? expire_seconds : 360;
        sip.invite_format = 'contact';
        sip.method = 'password';
        return sip;
    }

    static SIPURIDeviceSIPParams(sip_uri: any, expire_seconds?: number): SIPParams {
        const sip = new SIPParams();
        sip.username = (Math.random() + '').replace('.', ''); // NOSONAR
        sip.password = (Math.random() + '').replace('.', ''); // NOSONAR
        sip.expire_seconds = expire_seconds ? expire_seconds : 360;
        sip.invite_format = 'route';
        sip.method = 'password';
        sip.route = sip_uri;
        return sip;
    }

    static CellPhoneDeviceSIPParams(): SIPParams {
        const sip = new SIPParams();
        sip.expire_seconds = 360;
        sip.invite_format = 'contact';
        sip.method = 'password';
        return sip;
    }
}

export class EndpointMedia {
    audio: { codecs: string[] };
    video: { codecs: string[] };
    //bypass_media: boolean;
    encryption: any;
    //fax_option: boolean;
    //ignore_early_media: boolean;
    //progress_timeout: boolean;
    webrtc: boolean | undefined;


    constructor() {
        this.audio = {codecs: ['PCMU', 'PCMA']};
        this.video = {codecs: []};
        this.encryption = {enforce_security: false, methods: []};
    }
}

export class DeviceDetail {
    call_forward: CallForwardParameters | undefined;

    call_recording: CallRecording | undefined;
    call_restriction: any;
    call_waiting: any;
    caller_id: any;
    caller_id_options: any;
    contact_list: any;

    device_type: string;
    dial_plan: any;
    do_not_disturb: any;
    enabled = true;
    //exclude_from_queues: boolean;
    formatters: any;
    language: string | undefined;
    //mac_address: string;
    media: EndpointMedia;
    metaflows: any;
    //music_on_hold: any;
    //mwi_unsolicitated_updates: boolean;
    name: string | undefined;
    outbound_flags: any;
    owner_id: string | undefined;
    presence_id: string | undefined;
    provision: any;
    //register_overwrite_notify: boolean;
    ringtones: any = {};
    sip: SIPParams | undefined;
    //suppress_unregister_notifications: boolean;
    timezone: string | undefined;
    id: string | undefined;
    mobile_extension_enabled = false;
    //mobile_extension_callflow: string;

    constructor(device_type?: string) {
        this.device_type = device_type ? device_type : DEVICE_TYPE.softphone;
        this.media = new EndpointMedia();

        const call_restriction = {
            tollfree_us: {action: 'inherit'},
            toll_us: {action: 'inherit'},
            emergency: {action: 'inherit'},
            caribbean: {action: 'inherit'},
            did_us: {action: 'inherit'},
            international: {action: 'inherit'},
            unknown: {action: 'inherit'}
        };

        switch (this.device_type) {
            case DEVICE_TYPE.softphone:
            case DEVICE_TYPE.sip_device: {
                this.sip = SIPParams.SIPPhoneDeviceSIPParams(null, null);
                this.call_restriction = call_restriction;
                break;
            }
            case DEVICE_TYPE.smartphone: {
                this.sip = SIPParams.SIPPhoneDeviceSIPParams(null, null);
                this.call_forward = new CallForwardParameters(null, true);
                this.call_restriction = call_restriction;
                break;
            }
            case DEVICE_TYPE.cellphone: {
                this.sip = SIPParams.CellPhoneDeviceSIPParams();
                this.call_forward = new CallForwardParameters(null, false);
                break;
            }
            case DEVICE_TYPE.sip_uri: {
                this.sip = SIPParams.SIPURIDeviceSIPParams(null);
                break;
            }
        }
    }
}
