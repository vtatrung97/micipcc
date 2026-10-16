import {CallflowAction} from './abstract-callflow-module.model';
export class CfVoicemailElement extends CallflowAction {
    override readonly module = 'voicemail';
    override data: {
        id: string;
        action: string;
        callerid_match_login: boolean;
        interdigit_timeout: number;
        max_message_length: number;
        single_mailbox_login: boolean;
    };

    constructor(id: string) {
        super();
        this.data = {
            id: id,
            action: 'compose',
            callerid_match_login: false,
            interdigit_timeout: 2000,
            max_message_length: 500,
            single_mailbox_login: false
        };
        this.children = {};
    }
}
