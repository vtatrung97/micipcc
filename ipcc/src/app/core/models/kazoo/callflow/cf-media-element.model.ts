import {CallflowAction} from "./abstract-callflow-module.model";
export class CfMediaElement extends CallflowAction {
    override readonly module = "play";
    override data: {id: string};

    constructor(queueId: string) {
        super();
        this.data = {id: queueId};
    }
}
