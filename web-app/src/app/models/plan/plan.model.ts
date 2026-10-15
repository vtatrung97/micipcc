export interface Plan {
    planId: string,
    planTypeId?: number,
    planDisplayId?: string,
    planRealmId?: string,
    planName?: string,
    description?: string,
    planTypeIdList?: number[],
    statusList?: number[],
    descriptionGeneral?: string,
    descriptionDetail?: string,
    pricePerBlock?: number,
    currency?: string
    status?: number,
    defaultStorage?: number,
    minBlock?: number,
    maxBlock?: number,
    planCode?: string,
    pricePerMember?: number,
    memberFrom?: number,
    memberTo?: number,
    createdBy?: string,
    createTime?: number,
    updateBy?: string,
    updateTime?: number,
    functions?: string[],
    userAmount?: number
    prices?: PlanPrice[]
}
export interface Step {
    stepName: string,
}

export enum PlanTypeId {
    SwitchboardPlan = 1,
    DataPlan,
    VBPlan
}

export interface PlanType {
    planTypeId: number,
    description: string,
    status?: number
}
export interface Transaction {
    transactionId?: string;
    createTime?: number;
    cxTransactionStatusId?: number;
    cxErrorMessage?: string;
    value?: string;
    transactionDescription?: string;
    transactionCompleteDetail?: string;
    planId?: string;
    planName?: string;
    realmName?: string;
    registerTime?: number;
    member?: number;
    block?: number;
    duration?: number;
    qrCode?: string;
    psTransactionId?: string;
    psErrorCode?: string;
    psErrorMessage?: string;
    psErrorDisplayMessage?: string;
    agentName?: string;
    vtRequestId?: string;
}

export enum CxTransactionStatus {
    Failed = -1,
    Initiated,
    Created,
    Succeed,
    Canceled,
    ServerFailed,
    TimedOut
}

export interface PlanPrice {
    planPriceId: string,
    planId: string,
    currency?: string,
    memberFrom: number,
    memberTo?: number,
    pricePerMember?: number,
    minBlock?: number,
    maxBlock?: number,
    pricePerBlock?: number,
    priceBuyMaster?: number,
    priceBuyMember?: number,
    priceSustain?: number,
    priceCallOnnet?: number,
    priceCallOffnet?: number,
}
export interface PhoneNumberItem {
    provider: string;
    phoneNumber: string;
}

export class PlanFilterForm {
    planName?: string;
    planCode?: string
    planTypeIdList?: number[];
    price?: string;
    statusList?: number[];
    createdByList?: string[];
    updatedByList?: string[];
    description?: string;
    features?: string[];
    userAmount?: number;
    createdTimeRange?: {from: number | null, to: number | null};
    updatedTimeRange?: {from: number | null, to: number | null};
}
