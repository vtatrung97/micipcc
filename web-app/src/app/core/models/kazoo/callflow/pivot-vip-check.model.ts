import {CallflowAction} from "./abstract-callflow-module.model";

export class PivotVipCheckCallflowNode extends CallflowAction {
    override readonly module = "pivot";
    readonly type = "pivot_vip_check";
    override data: { voice_url: string, req_format: string, method: string, debug: boolean, req_body_format: string, min_rank_required: number, vip_callflow_id: string, non_vip_callflow_id: string, blacklist_callflow_id: string };

    constructor(minRankRequired: number, vipCallflow: string, nonVipCallflow: string, blacklistCallflow: string) {
        super();
        this.data = {
            voice_url: `MOBILE_EXTENSION_SERVICE/pivot-vip-check/${minRankRequired}/${vipCallflow}/${nonVipCallflow}/${blacklistCallflow}`,
            req_format: 'kazoo',
            method: 'get',
            debug: false,
            req_body_format: 'form',
            min_rank_required: minRankRequired,
            vip_callflow_id: vipCallflow,
            non_vip_callflow_id: nonVipCallflow,
            blacklist_callflow_id: blacklistCallflow
        };
        this.children = {
            _: {
                module: "callflow",
                data: {id: nonVipCallflow},
                children: {}
            }
        };
    }
}
