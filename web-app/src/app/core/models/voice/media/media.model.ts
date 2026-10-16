export class MediaFilterForm {
    mediaName?: string;
    mediaCode?: string;
    fileName?: string
    lstMediaTypeId?: [];
    createByList?: [];
    createTimeRange?: object;
    updateByList?: [];
    updateTimeRange?: object;
    groupId: string | null;
}

export class MediaModel {
    mediaId: string;
    mediaName?: string;
    mediaCode?: string;
    fileName?: string
    mediaType?: number;
    createTime?: number;
    groupId?: string;
    status?: number;
    lstMediaTypeId?: string[];
    lstMediaType: MediaType[];
    notifyType?: number;
}

export class MediaAddForm {
    mediaName: string;
    fileName: string;
    mediaTypeList: [];
}

export class MediaType {
    mediaTypeId: string;
    mediaTypeName: string;
    status: number;
    realmName: string;
    groupId: string;
    isEdit?: any;
    isEditable?: any;
}
