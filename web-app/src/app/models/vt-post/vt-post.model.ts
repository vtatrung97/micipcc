export interface IBill {

}

export class FilterForm {
    orderCode: string;
    senderName: string
    status: number;
    complaint_status: number;
    receipientName: string;
    cod: string;
    fare: string;
    totalPayment: string;
}

export class FilterHisForm {
    maVanDon: string;
    sort?: string
}

export class RelatedOrder {
    orderCode: string;
    senderName: string
    status: number;
    complaint_status: number;
    receipientName: string;
    cod: string;
    fare: string;
    totalPayment: string;
}

export class ComplaintHis {
    complaintDate: string;
    type: string
    complaintSubject: string;
    postOffProcess: string;
    statusList: string;
    level: string;
    content: string;
    complaintChannel: string;
    complaintSource: string;
}
 