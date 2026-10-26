export class VmboxSummary {
    id: string;
    name: string;
    mailbox: number;
    message: number;
    owner_id: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}

export class VmboxDetail {
    id: string;
    name: string | undefined;
    type: string;
    media: {
        unavailable: string
    };
    mailbox: string | undefined;
    owner_id: string | undefined;
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
    timezone = 'Asia/Jakarta';

    constructor(name?: string, mailbox?: string, owner_id?: string) {
        this.name = name;
        this.mailbox = mailbox;
        this.owner_id = owner_id;
    }
}
