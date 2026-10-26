import { DisplayContactType } from "@core/constant/ticket.enum";

export class CustomerContactType{
    contactTypeId: string;
    name?: string;
    description?: string;
    createTime?: number;
    createBy?: string;
    updateTime?: number;
    updateBy?: string;
    manual?: number;
    status?: number;
    validateExpression?: string;
    displayType?: DisplayContactType
}