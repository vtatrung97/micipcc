export function convertDataCategories(data: any, isShowSelectAll = true, isCategory : boolean = false) {
    if (data && Array.isArray(data) && data.length > 0) {
        let flatData = flattenData(data);
        const uuidSelectAll = generateUUID();
        const uuidNoCategory = generateUUID();

        let dataConverted = [...flatData
            .sort((a: any, b: any) => a.type! - b.type!)
            .map((g: any) => {
                if (!g.voiceChannelGroupId) {
                    return {
                        id: g.voiceChannelId!.trim(),
                        parentId: (g.voiceChannelGroupId ? g.voiceChannelGroupId?.trim() : (isShowSelectAll ? uuidSelectAll : '')),
                        name: g.voiceChannelGroupName!,
                        type: 0,
                        number: 0
                    };
                } else {
                    return {
                        id: g.voiceChannelId!.trim(),
                        parentId: (g.voiceChannelGroupId ? g.voiceChannelGroupId?.trim() : ""),
                        name: g.voiceChannelName!,
                        type: 0,
                        number: g.voiceChannelNumber
                    };
                }
            })
        ];

        if (isShowSelectAll) {
            let lang = localStorage.getItem('language');

            dataConverted.push({
                id: uuidSelectAll,
                parentId: "",
                name: (lang === 'vi' || lang === '112') ? 'Chọn tất cả' : 'Select All',
                type: 0,
                number: 0
            });
            if(isCategory) {
                dataConverted.push({
                    id: uuidNoCategory,
                    parentId: "",
                    name: (lang === 'vi' || lang === '112') ? 'Không nhập danh mục dịch vụ' : 'No Category',
                    type: 0,
                    number: -1
                });
            }
        }

        return dataConverted;
    } else {
        return [];
    }
}

export function flattenData(data: Array<any>): any {
    const result: any = [];
    data.forEach(item => flatten(result, item));
    return result;
}

export function flatten(result: any, data: any) {
    result.push(data);
    if (data.children && data.children.length > 0) {
        data.children.forEach((child: any) => flatten(result, child));
    }
}

export function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function convertDepartments(data: any, isShowSelectAll = true) {
    if (data && Array.isArray(data) && data.length > 0) {
        let flatData = flattenData(data);
        const uuidSelectAll = generateUUID();
        let dataConverted = [...flatData
            .sort((a: any, b: any) => a.type! - b.type!)
            .map((g: any) => {
                if (!g.parentId || g.parentId.trim().length === 0) {
                    return {
                        id: g.id!.trim(),
                        parentId: isShowSelectAll ? uuidSelectAll : '',
                        name: g.name!,
                        type: g.type ? g.type : 0
                    }
                } else {
                    return {
                        id: g.id!.trim(),
                        parentId: g.parentId?.trim() ?? "",
                        name: g.name!,
                        type: g.type ? g.type : 0
                    }
                }

            })
        ];

        if (isShowSelectAll) {
            let lang = localStorage.getItem('language');

            dataConverted.push({
                id: uuidSelectAll,
                parentId: "",
                name: (lang === 'vi' || lang === '112') ? 'Chọn tất cả' : 'Select All',
                type: 0,
            });
        }

        return dataConverted;
    } else {
        return [];
    }
}
