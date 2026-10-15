export class PermisstionTagFilterForm {
    sourceName?: string;
}

export class PermissionTag {
    id?: string;
    sourceName: string;
    sourceId: string;
    permissionTagDescription: string;
    isTelephonist: number;
    status?: number | undefined;
}