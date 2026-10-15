export class VmboxSummary {
    id: string;
    name: string;
    mailbox: number;
    message: number;
    owner_id: string;

    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }
}
