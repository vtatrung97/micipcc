import {IdName} from './id-name.model';
export class QueueSummary extends IdName {
    constructor(id: string, name: string) {
        super();
        this.id = id;
        this.name = name;
    }
}
