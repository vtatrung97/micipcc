import {KAZOO} from "../../app.constants";
export class VmboxDetail {
    id: string;
    name: string;
    type: string;
    media: {
        unavailable: string
    };
    mailbox: string;
    owner_id: string;
    pin: string;
    require_pin: boolean;
    check_if_owner: boolean;

    is_setup: boolean;
    media_extension: string;
    not_configurable: boolean;
    notify_email_addresses: string[];
    save_after_notify: boolean;
    delete_after_notify: boolean;
    skip_greeting: boolean;
    skip_instructions: boolean;
    ui_metadata: any;
    timezone = 'Asia/Jakarta';

    constructor(name: string, mailbox: string, owner_id: string) {
        this.name = name;
        this.mailbox = mailbox;
        this.owner_id = owner_id;
        this.ui_metadata = KAZOO.UI_METADATA_VOIP;
    }
}
