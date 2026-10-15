type DatatableRes = {
    draw: number,
    recordsTotal: number,
    recordsFiltered: number,
    data: any[],
    error?: string,
    COUNT?: any
}


export function datatableAjax(url: string, accessToken: string, form?: any, method?: string, realm?: string, idSrc?: string, toastSvc?: any, language?: any): any {
    let groupId = localStorage.getItem('selectedServiceOwner');

    if (method == null) {
        method = 'GET';
    }

    return {
        url: url,
        type: method,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-ipcc2-realm': realm,
            'groupId': groupId,
            'Accept-Language': language
        },
        data: (data: any) => {
            for (let i = 0; i < data.columns.length; i++) {
                let column = data.columns[i];
                column.searchRegex = column.search.regex;
                column.searchValue = column.search.value;
                delete (column.search);
            }
            if (form) {
                for (let key in form) {
                    if (data.hasOwnProperty(key)) {
                        // console.warn("[datatableAjax] using form value for key: " + key);
                        data[key] = encodeURIComponent(form[key]);
                    }
                    if (form[key] != "" && form[key] != null && form[key] != undefined) {
                        if (Array.isArray(form[key])) {
                            // Dạng chuỗi CSV: "value1,value2"
                            data[key] = form[key].join(',');
                        } else {
                            data[key] = form[key];
                        }
                    };
                }
            }
        },
        dataFilter: (data: any) => {
            let json = JSON.parse(data);
            json.data.data.forEach((item: any, index: any) => item.DT_RowId = `row_${index}`)
            let datatableRes: DatatableRes = {
                draw: json.data.draw,
                recordsTotal: json.data.recordsTotal,
                recordsFiltered: json.data.recordsTotal,
                data: json.data.data,
                COUNT: json.data?.COUNT
            }
            return JSON.stringify(datatableRes); // return JSON string
        },
        error: function (xhr: any, error:any, code:any) {
            if(xhr.responseJSON.message == "Khoảng thời gian khách hàng yêu cầu không được vượt quá 2 ngày") {
                alert("Hệ thống đang gặp sự cố, vui lòng nhập khoảng thời gian nhỏ hơn 2 ngày để tìm kiếm!")
                console.log(xhr, code);
            }
            console.log("🚀 ~ datatableAjax ~ xhr.responseJSON.message:", xhr.responseJSON.message)
            if(toastSvc && xhr.responseJSON.message) {
                toastSvc.showDanger(xhr.responseJSON.message)
            }

        }
    };
}
export function datatableAjaxCustomHeaders(url: string, accessToken: string, form?: any, method?: string, realm?: string, idSrc?: string, toastSvc?: any, language?: any): any {
    let groupId = localStorage.getItem('selectedServiceOwner');
    let lang = localStorage.getItem('language');
    return {
        url: url,
        type: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-ipcc2-realm': realm,
            'groupId': groupId,
            'Accept-Language': language,
            'Locale': lang == 'vn' ? 'vi' : 'en'
        },
        data: (data: any) => {
            for (let i = 0; i < data.columns.length; i++) {
                let column = data.columns[i];
                column.searchRegex = column.search.regex;
                column.searchValue = column.search.value;
                delete (column.search);
            }
            if (form) {
                for (let key in form) {
                    if (data.hasOwnProperty(key)) {
                        // console.warn("[datatableAjax] using form value for key: " + key);
                        data[key] = encodeURIComponent(form[key]);
                    }
                    if (form[key] != "" && form[key] != null && form[key] != undefined) data[key] = form[key];
                }
            }
        },
        dataFilter: (data: any) => {
            let json = JSON.parse(data);
            json.data.data.forEach((item: any, index: any) => item.DT_RowId = `row_${index}`)
            let datatableRes: DatatableRes = {
                draw: json.data.draw,
                recordsTotal: json.data.recordsTotal,
                recordsFiltered: json.data.recordsTotal,
                data: json.data.data,
            }
            return JSON.stringify(datatableRes); // return JSON string
        },
        error: function (xhr: any, error:any, code:any) {
            if(xhr.responseJSON.message == "Khoảng thời gian khách hàng yêu cầu không được vượt quá 2 ngày") {
                alert("Hệ thống đang gặp sự cố, vui lòng nhập khoảng thời gian nhỏ hơn 2 ngày để tìm kiếm!")
                console.log(xhr, code);
            }
        }
    };
}
export function datatableAjax2(url: string, accessToken: string, form?: any, method?: string, realm?: string, dataSource?:any, deleteData?: string[], idSrc?: string, toastSvc?: any, language?: any): any {
    let groupId = localStorage.getItem('selectedServiceOwner');
    return {
        url: url,
        type: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'x-ipcc2-realm': realm,
            'groupId': groupId,
            'Accept-Language': language
        },
        data: (data: any) => {
            for (let i = 0; i < data.columns.length; i++) {
                let column = data.columns[i];
                column.searchRegex = column.search.regex;
                column.searchValue = column.search.value;
                delete (column.search);
            }
            if (form) {
                for (let key in form) {
                    if (data.hasOwnProperty(key)) {
                        // console.warn("[datatableAjax] using form value for key: " + key);
                        data[key] = encodeURIComponent(form[key]);
                    }
                    if (form[key] != "" && form[key] != null && form[key] != undefined) data[key] = form[key];
                }
            }
        },
        dataFilter: (data: any) => {
            let json = JSON.parse(data);
            if (dataSource){
                json.data.data= [...json.data.data, ...dataSource]
            }
            if (deleteData){
                json.data.data = json.data.data.map( (item:any) =>{
                    if (!deleteData.includes(item)){
                        return item
                    }
                })
            }

            json.data.data?.forEach((item: any, index: any) => item.DT_RowId = `row_${index}`)
            let datatableRes: DatatableRes = {
                draw: json.data.draw,
                recordsTotal: json.data.recordsTotal,
                recordsFiltered: json.data.recordsTotal,
                data: json.data.data,
            }
            return JSON.stringify(datatableRes); // return JSON string
        },
        error: function (xhr: any, error:any, code:any) {
            if(xhr.responseJSON.message == "Khoảng thời gian khách hàng yêu cầu không được vượt quá 2 ngày") {
                alert("Hệ thống đang gặp sự cố, vui lòng nhập khoảng thời gian nhỏ hơn 2 ngày để tìm kiếm!")
                console.log(xhr, code);
            }
        }
    };
}

/*dùng cho trường hợp mà filter muốn keep lại, thì form sẽ truyền vào là 1 function để không bị call lại api của table nhiều lần, không cần reload lại table*/
export function datatableAjaxWithFilter(
    url: string,
    accessToken: string,
    getForm: (() => any) | null,
    method: string | null,
    realm?: string,
    idSrc?: string,
    toastSvc?: any
) {
    let groupId = localStorage.getItem('selectedServiceOwner');
    method ??= 'GET';
    return {
        url,
        type: method,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Accept-Language": realm,
            groupId: groupId ?? "",
        },

        data: (data: any) => {
            // const data: any = {};
            // Search của DataTable
            // d.columns.forEach((col: any) => {
            //     if (col.search.value) {
            //         data[col.data] = encodeURIComponent(col.search.value);
            //     }
            // });
            for (let i = 0; i < data.columns.length; i++) {
                let column = data.columns[i];
                column.searchRegex = column.search.regex;
                column.searchValue = column.search.value;
                delete (column.search);
            }

            // Lấy filter mới nhất tại thời điểm request
            const form = getForm ? getForm() : null;
            if (form) {
                for (let key in form) {
                    if (data.hasOwnProperty(key)) {
                        // console.warn("[datatableAjax] using form value for key: " + key);
                        data[key] = encodeURIComponent(form[key]);
                    }
                    if (form[key] != "" && form[key] != null && form[key] != undefined) {
                        if (Array.isArray(form[key])) {
                            // Dạng chuỗi CSV: "value1,value2"
                            data[key] = form[key].join(',');
                        } else {
                            data[key] = form[key];
                        }
                    };
                }
            }

            // return data;
        },

        dataFilter: (response: any) => {
            const json = JSON.parse(response);
            json.data.data.forEach((item: any, index: number) => {
                item.DT_RowId = `row_${index}`;
            });
            return JSON.stringify({
                draw: json.data.draw,
                recordsTotal: json.data.recordsTotal,
                recordsFiltered: json.data.recordsTotal,
                data: json.data.data,
                COUNT: json.data?.COUNT
            });
        },
        error: function (xhr: any, error:any, code:any) {
            if(xhr.responseJSON.message == "Khoảng thời gian khách hàng yêu cầu không được vượt quá 2 ngày") {
                alert("Hệ thống đang gặp sự cố, vui lòng nhập khoảng thời gian nhỏ hơn 2 ngày để tìm kiếm!")
                console.log(xhr, code);
            }
            console.log("🚀 ~ datatableAjax ~ xhr.responseJSON.message:", xhr.responseJSON.message)
            if(toastSvc && xhr.responseJSON.message) {
                toastSvc.showDanger(xhr.responseJSON.message)
            }

        }
    };
}

