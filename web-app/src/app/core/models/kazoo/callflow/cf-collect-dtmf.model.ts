import {CallflowAction} from "./abstract-callflow-module.model";

export interface CfCollectDtmfData {
    max_digits: number,
    collection_name: string,
    timeout?: number, //milliseconds
    interdigit_timeout?: number
}

export class CfCollectDtmf extends CallflowAction {
    override readonly module = "collect_dtmf";
    override data: CfCollectDtmfData;

    constructor(max_digits: number, collection_name: string, timeout?: number, interdigit_timeout? :number) {
        super();
        this.children = {};

        this.data = {collection_name: collection_name, max_digits: max_digits};
        this.data.timeout = timeout ? timeout : 5000;
        this.data.interdigit_timeout = interdigit_timeout ? interdigit_timeout : 2000;
    }
}
