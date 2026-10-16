import {CallflowAction} from "./abstract-callflow-module.model";
export class CfQueueElement extends CallflowAction {
    override readonly module = "acdc_member";
    override data: {id: string};
    constructor(queueId: string) {
        super();
        this.data = {id: queueId};
    }
}
