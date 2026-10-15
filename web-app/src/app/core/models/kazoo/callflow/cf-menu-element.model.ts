import {CallflowAction} from "./abstract-callflow-module.model";

export class CfMenuElement extends CallflowAction {
    override readonly module = "menu";
    override data: {id: string};

    constructor(menuId: string) {
        super();
        this.data = {id: menuId};
        this.children = {};
    }
}
