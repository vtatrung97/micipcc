export class TemporalRuleSummary {
    id: string;
    name: string;
    type: string;
}

export class TemporalRuleDetail {
    id: string;
    name: string;
    type: string;
    cycle: string;
    interval: number;
    time_window_start: number;
    time_window_stop: number;
    wdays: string[];

    days: number[];
    month: number;

    start_date: number;


    constructor(obj?: { name: string, type: string, cycle: string, interval: number, time_window_start: number, time_window_stop: number, wdays: string[], start_date: number }) {
        if (obj) {
            this.name = obj.name;
            this.type = obj.type;
            this.cycle = obj.cycle;
            this.interval = obj.interval;
            this.time_window_start = obj.time_window_start;
            this.time_window_stop = obj.time_window_stop;
            this.wdays = obj.wdays;
            this.start_date = obj.start_date;
        }
    }
}

export class TemporalRulesSetSummary {
    id: string;
    name: string;
    temporal_rules: string[];
}

export class TemporalRulesSetDetail extends TemporalRulesSetSummary {
    type: string;
}
