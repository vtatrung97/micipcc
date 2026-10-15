export class MenuDetail {
    id: string;
    name: string;
    timeout: number = 10000;
    interdigit_timeout: number = 2000;
    max_extension_length: number = 4;
    delay_200_ok: false;
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

    group_id: string;

    realm_name: string
    constructor(obj?: { name?: string, type?: string, data?: any }) {
        if (obj && obj.name) {
            this.name = obj.name;
        }
        if (obj && obj.type) {
            this.type = obj.type;
        }
        this.media = {invalid_media: true, transfer_media: true, exit_media: true};
    }
}
