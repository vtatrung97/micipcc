type DatatableRes = {
    draw: number,
    recordsTotal: number,
    recordsFiltered: number,
    data: any[],
    error?: string,
    COUNT?: any
}


export function datatableAjaxAutoAnswer(url: string, accessToken: string, form?: any, method?: string, realm?: string, idSrc?: string, toastSvc?: any, language?: any): any {
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
            console.log(xhr, error);

            if(xhr.responseJSON.message == "Khoảng thời gian khách hàng yêu cầu không được vượt quá 2 ngày") {
                alert("Hệ thống đang gặp sự cố, vui lòng nhập khoảng thời gian nhỏ hơn 2 ngày để tìm kiếm!")
                console.log(xhr, code);
            }
            console.log("🚀 ~ datatableAjax ~ xhr.responseJSON.message:", xhr.responseJSON.message)
            if(toastSvc && xhr.responseJSON.message) {
                toastSvc.showDanger(xhr.responseJSON.message)
            }
            // Tắt loading icon
            $('.dataTables_processing').hide();
        }
    };
}

