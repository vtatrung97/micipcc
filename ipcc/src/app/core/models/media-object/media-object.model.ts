export class MediaObject {
    mediaId: string;
    mediaType: number;
    objectId?: string;
    objectName?: string;
    mediaName?: string;
    createTime?: number;
    createBy?: string;
    updateTime?: number;
    updateBy?: string;
}

export class MediaObjectSearchForm {
    mediaType?: number | null;
    mediaName?: string | null;
    listObjectIds?: [];
    createTimeRange?: object;
    listAgentsCreate?: [];
    updateTimeRange?: object;
    listAgentsUpdate?: [];
}

export class Media {
    mediaId: string;
    mediaName: string;
    fileName: number;
    status: number;
    createBy: string;
    createTime: number;
    isEdit?: any;
}

export class Rank {
    rankId: string;
    rankName: string;
    createTime: number;
    createBy: string;
}

export class Area {
    areaId: string;
    areaName: string;
    createTime: number;
    createBy: string;
}


