export class Transaction {
    transactionId?: string;
    value?: string;
    transactionDescription?: string;
    transactionDetail?: TransactionDetail;
    transactionCompleteDetail?: string;
    psTransactionId?: string;
    psErrorCodeId?: number;
    psErrorMessage?: string;
    psErrorMessageDisplay?: string;
    psTransactionStatusId?: number;
    cxTransactionStatusId?: number;
    cxErrorMessage?: string;
    status?: number;
    realmName?: string;
    createBy?: string;
    createTime?: number;
    updateBy?: string;
    updateTime?: number;
    planId?: string;
}

export class TransactionDetail {
    registerTime?: number;
    planId?: string;
    member?: number;
    duration?: number;
    price?: number;
}