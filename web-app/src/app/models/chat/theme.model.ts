export class ThemeModel {
    themeId?: string;
    themeName?: string;
    createBy?: string;
    createTime?: number;
    updateBy?: string;
    updateTime?: number;
    status?: number;
    realmName: string | undefined;
    groupId?: string;
    storeFilePath?: string;
    isDefault?: number;
    type?: number;
}