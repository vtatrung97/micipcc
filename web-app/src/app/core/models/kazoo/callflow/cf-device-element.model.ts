import {CallflowAction} from "./abstract-callflow-module.model";
export class CfDeviceElement extends CallflowAction {
    override readonly module = "device";
    override data: {
        id: string;
        timeout: number;
        can_call_self: boolean;
        delay: number;
    };

    constructor(deviceId: string, connectTimeout: number) {
        super();
        this.data = {id: deviceId, timeout: connectTimeout, can_call_self: false, delay: 0};
    }
}
