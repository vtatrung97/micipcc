import {CallflowAction} from "./abstract-callflow-module.model";

export interface CfBranchVariableData {
    variable: string,
    scope?: string
}

export class CfBranchVariable extends CallflowAction {
    override readonly module = "branch_variable";
    override data: CfBranchVariableData;

    constructor(variable: string, scope?: string) {
        super();
        this.children = {};

        this.data = {variable: variable, scope: 'custom_channel_vars'};
        if (scope) {
            this.data.scope = scope;
        }
    }
}
