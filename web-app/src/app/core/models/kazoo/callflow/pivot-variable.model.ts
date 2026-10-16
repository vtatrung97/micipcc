import {CallflowAction} from "./abstract-callflow-module.model";

export interface CfPivotVariableData {
    voice_url: string,
    req_format: string,
    method: string,
    debug: boolean,
    req_body_format: string,
    service_code: string,
    callback_callflow: string
}

export class PivotVariableCallflowNode extends CallflowAction {
    override readonly module = "pivot";
    readonly type = "pivot_variable";
    override data: CfPivotVariableData;

    constructor(service_code: string, callback_callflow: string) {
        super();
        this.data = {
            voice_url: `MOBILE_EXTENSION_SERVICE/call-variable/${service_code}/${callback_callflow}`,
            req_format: 'kazoo',
            method: 'get',
            debug: false,
            req_body_format: 'form',
            service_code: service_code,
            callback_callflow: callback_callflow
        };
        this.children = {
            _: {
                module: "callflow",
                data: {id: callback_callflow},
                children: {}
            }
        };
    }
}
