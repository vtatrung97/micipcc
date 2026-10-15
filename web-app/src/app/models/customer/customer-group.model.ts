export class CustomerGroup {
    customerGroupId: string;
    code?: string;
    name?: string;
    source?: number;
    viewPopup?: number;
    description?: string;
    status?: number;
    colour?: string;

    failedQueues?: string[];
}

export class Customer {
    customerContactId: string;
    customerId: string;
    phoneNumber?: string;
    status?: number;
}

export class CustomerPhone {
    customerGroupPhoneId?: string;
    phoneNumber: string;
    description?: string;
    customerGroupId: string;
    realmName?: string;
    createTime?: number;
    createBy?: string;
    updateBy?: string;

    customerCode?: string;
    address?: string;
    taxCode?: string;
    identityCode?: string;
}

export class CustomerGroupSearchForm {
    code?: string;
    name?: string;
    sourceList?: [];
    viewPopupList?: [];
    queueIdList?: [];
    createByList?: [];
    createTimeRange?: object;
    updateTimeRange?: object;
    groupId: string | null;
    from?: string;
    excludedCustomerGroupIdList?: string[] | null;
}

export class CustomerGroupCustomerSearchForm {
    phoneNumber?: string;
    groupId: string | null;
}

export class CustomerGroupCustomerQueueSearchForm {
    phoneNumber?: string;
    queueId?: string;
}


export class CustomerPhoneValidationResponse {
    validCustomerPhones: CustomerPhone[];
    invalidCount: number;
    linkUrl: string;
    linkUrlPublic: string;
    filePath: string;
    fileName: string;
    fileSize: number;
}
