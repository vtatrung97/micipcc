export class CallForwardParameters {
    enabled: boolean = false;
    failover: boolean = false;
    number: any;
    direct_calls_only: boolean = false;
    substitute: boolean = true;
    require_keypress: boolean = false;
    keep_caller_id: boolean = false;
    ignore_early_media: boolean = true;


    constructor(number?: any, failover?: boolean) {
        this.number = number ? number : null;
        this.failover = failover ? failover : false;
        this.enabled = !this.failover;
    }
}
