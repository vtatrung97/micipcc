import {QueueSummary} from './queue-summary.model';
export class QueueDetail extends QueueSummary {
    agent_ring_timeout: number;
    agent_wrapup_time: number;
    connection_timeout: number = 60;
    max_queue_size: number;
    max_priority = 1;
    record_caller: boolean;
    agents: string[] = []; // cac agent dang online tai queue

    caller_exit_key: string = '#';
    enter_when_empty: boolean = true;
    ring_simultaneously: number = 1;
    strategy: string = 'round_robin';
    queueId: any;
    moh: string;
}
