export class NotificationModel {
    notificationId: string;

    agentId: string;

    payload?: string;

    notiType?: number;

    createBy?: string;

    createTime?: number;

    updateBy?: string;

    updateTime?: number;

    realmName?: string;

    isRead?: number;

    referId?: string;

    payloadObject?: any;
}
