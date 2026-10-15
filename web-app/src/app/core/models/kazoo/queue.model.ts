// @ts-ignore
import {IdName} from "../id-name.model";

export class QueueSummary extends IdName {
    constructor(id: string, name: string) {
        super(id, name);
    }
}

export class QueueDetail extends QueueSummary {
    agent_ring_timeout: number = 0;
    agent_wrapup_time: number = 20;
    connection_timeout: number = 60;
    max_queue_size: number;
    max_priority = 1;
    record_caller: boolean;
    agents: string[] = []; // cac agent dang online tai queue

    caller_exit_key: string = '#';
    enter_when_empty: boolean = true;
    ring_simultaneously: number = 1;
    strategy: string = 'round_robin';
    voice_channel_number: string = "";
    queueId: any;
    moh: string;
}
