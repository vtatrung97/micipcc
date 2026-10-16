export class LimitModel {
    version: string;
    allow_prepay: boolean;
    id: 'limits';
    inbound_trunks: number;
    twoway_trunks: number;
    outbound_trunks: number;
    ui_metadata: {
        version: string;
        ui: string;
        origin: string;
    };

    constructor(allow_prepay: boolean, id: any, inbound_trunks: number,twoway_trunks:number, outbound_trunks: number,
                ui_metadata: { version: string; ui: string; origin: string }) {
        this.allow_prepay = allow_prepay;
        this.id = id;
        this.inbound_trunks = inbound_trunks;
        this.twoway_trunks = twoway_trunks;
        this.outbound_trunks = outbound_trunks;
        this.ui_metadata = ui_metadata;
    }

}
