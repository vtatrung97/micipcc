import {CallflowAction} from "./abstract-callflow-module.model";
export class CfCallflowElement extends CallflowAction {
    override readonly module = "callflow";
    override data: {id: string};
    constructor(callflowId: string) {
        super();
        this.data = {id: callflowId};
        this.children = {};
    }
}
