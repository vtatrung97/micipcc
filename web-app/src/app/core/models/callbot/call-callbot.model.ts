import {CallbotHistory} from "@core/models/callbot/callbot-history.model";

export class CallCallBot {
    callCallbotId?: string;
    callId?: string;
    callbotTransferName?: string;
    callbotTransferDescription?: string;
    botCode?: string;
    callingNumber? :string;
    calledNumber? :string;
    referCallee? :string;
    callbotHistory?: CallbotHistory [];
}
