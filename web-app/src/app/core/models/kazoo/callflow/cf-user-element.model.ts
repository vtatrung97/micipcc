import {CallflowAction} from './abstract-callflow-module.model';
export class CfUserElement extends CallflowAction {
    override readonly module = 'user';
    override data: {
        id: string;
        timeout: number;
        can_call_self: boolean;
        delay: number;
        strategy: string; // "simultaneous"
    };

    constructor(userId: string, connectTimeout: number) {
        super();
        this.data = {id: userId, timeout: connectTimeout, can_call_self: false, delay: 0, strategy: 'simultaneous'};
        this.children = {};
    }
}
