export class EmailAccount {
    emailAccountId?: string
    emailAddress?: string
    accountName?: string
    createBy?: string
    createTime?: number
    updateBy?: string
    updateTime?: number
    isDefault?: number
    incomingServer?: string
    incomingServerAuth?: string
    incomingServerPort?: number
    incomingServerProtocol?: string
    outgoingServer?: string
    outgoingServerAuth?: string
    outgoingServerPort?: number
    outgoingServerProtocol?: string
    changePassword?: boolean
    oldPassword?: string
    password?: string 
    startTime?: number
    status?: number
    groupId?: string
    timeStoreMail?: number
}

export class EmailAccountFilterForm {
    accountName?: string;
    emailAddress?: string;
    status?: string;
    createdBy?: string;
    updatedBy?: string;
    createdTimeRange: any;
    updatedTimeRange: any;
    groupId?: string;
}

export enum EmailStatus {
    inactive = 0,
    success = 1,
    fail = 2,
    creating = 3,
    updating = 4,
    deleting = 5,
    locked = 6
}