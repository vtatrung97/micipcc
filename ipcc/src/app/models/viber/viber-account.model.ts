export interface ViberAccount {
    id?: string;
    accountName: string;
    username: string;
    password: string;
    displayName: string;
    status?: string;
    createdDate?: Date;
    updatedDate?: Date;
    createdBy?: string;
    updatedBy?: string;
    groupId?: string;
}

export interface ViberAccountSearch {
    accountName?: string;
    username?: string;
    displayName?: string;
    status?: string;
    createdBy?: string;
    updatedBy?: string;
    createdDateRange?: any;
    updatedDateRange?: any;
    groupId?: string;
}
