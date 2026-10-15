import { DATA_TYPE_ATTRIBUTE_CONFIG, STATUS } from "@core/constant/user.contants";
import { ROLES } from "@core/constant/user.contants";
import { STATUS_ACCOUT } from "@core/enums/users.enum";

type DatatableRes = {
    draw: number,
    recordsTotal: number,
    recordsFiltered: number,
    data: any[],
    error?: string,
    COUNT?: any
}

/*dùng post thì phải thêm
    contentType: "application/json", // định dạng body là JSON
    processData: false,

    và return JSON.stringify(body);
*/
export function datatableAjaxAccount(url: string, accessToken: string, getFilterForm: () => any, method?: string, realm?: string, columnSortDefault?: string, idSrc?: string, toastSvc?: any, language?: any): any {
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
        ...(method === "POST"
            ? {
                contentType: "application/json", // định dạng body là JSON
                processData: false,
                data: (data: any) => {
                    let columnSort = 'name,DESC';
                    let sortBy = 'createdTime';
                    let sortDir = 'DESC';
                    if (data.order && data.order.length > 0) {
                        const sort = data.order[0]; // lấy sort đầu tiên
                        const colIndex = sort.column;
                        sortDir = sort.dir.toUpperCase(); // ASC/DESC

                        const col = data.columns[colIndex];
                        sortBy = col.name || col.data; // ưu tiên name, fallback sang data
                    }
                    // Khởi tạo body với thông tin phân trang từ DataTables
                    let body: any = {
                        page: Math.floor(data.start / data.length),
                        size: data.length,
                        sortBy: sortBy,
                        sortDir: sortDir
                    };

                    // lấy filter mới nhất từ callback
                    const filter = getFilterForm();
                    if (filter) {
                        Object.keys(filter).forEach((key) => {
                            const value = filter[key];
                            if (value !== "" && value !== null && value !== undefined) {
                                body[key] = value;
                            }
                        });
                    }

                    return JSON.stringify(body);
                },
            }
            : {
                // GET: giữ nguyên data + merge filter
                data: (data: any) => {
                    let columnSort = 'name,DESC';
                    if (data.order && data.order.length > 0) {
                        const sort = data.order[0]; // lấy sort đầu tiên
                        const colIndex = sort.column;
                        const dir = sort.dir.toUpperCase(); // ASC/DESC

                        const col = data.columns[colIndex];
                        const name = col.name || col.data; // ưu tiên name, fallback sang data
                        columnSort = `${name},${dir}`;
                    }
                    // Khởi tạo body với thông tin phân trang từ DataTables
                    let body: any = {
                        page: Math.floor(data.start / data.length),
                        size: data.length,
                        sort: columnSort
                    };

                    // lấy filter mới nhất từ callback
                    const filter = getFilterForm();
                    if (filter) {
                        Object.keys(filter).forEach((key) => {
                            const value = filter[key];
                            if (value !== "" && value !== null && value !== undefined) {
                                body[key] = value;
                            }
                        });
                    }
                    return body; // DataTables sẽ encode thành query string
                }
            }),
        dataFilter: (data: any) => {
            let json = JSON.parse(data);
            json.data.data.forEach((item: any, index: any) => {
                item.DT_RowId = `row_${index}`;
                // const role = ROLES.find(r => r.value === item?.realmRole);
                // item['roleName'] = role?.name;
                // item['roleCss'] = role?.classCss;
                const status = STATUS.find(s => s.value === item?.status);
                item['statusName'] = status?.name;
                item['statusCss'] = status?.classCss;
                item['isDisableRow'] = item?.status === STATUS_ACCOUT.KHONG_HOAT_DONG || item?.status === STATUS_ACCOUT.DANG_DONG_BO;
                item['isDisableRowTdCheckbox'] = true;
            })
            let datatableRes: DatatableRes = {
                draw: json.data.draw,
                recordsTotal: json.data.total,
                recordsFiltered: json.data.total,
                data: json.data.data,
                COUNT: json.data?.COUNT
            }
            return JSON.stringify(datatableRes); // return JSON string
        },
        error: function (xhr: any, error: any, code: any) {
            if (xhr.responseJSON.message == "Khoảng thời gian khách hàng yêu cầu không được vượt quá 2 ngày") {
                alert("Hệ thống đang gặp sự cố, vui lòng nhập khoảng thời gian nhỏ hơn 2 ngày để tìm kiếm!")
                console.log(xhr, code);
            }
            console.log("🚀 ~ datatableAjax ~ xhr.responseJSON.message:", xhr.responseJSON.message)
            if (toastSvc && xhr.responseJSON.message) {
                toastSvc.showDanger(xhr.responseJSON.message)
            }

        }
    };
}

export function datatableAjaxUserAttributeConfig(url: string, accessToken: string, form?: any, method?: string, realm?: string, columnSortDefault?: string, idSrc?: string, toastSvc?: any, language?: any): any {
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
            let columnSort = 'createdAt,DESC';
            if (data.order && data.order.length > 0) {
                const sort = data.order[0]; // lấy sort đầu tiên
                const colIndex = sort.column;
                const dir = sort.dir.toUpperCase(); // ASC/DESC

                const col = data.columns[colIndex];
                const displayName = col.name || col.data; // ưu tiên name, fallback sang data
                columnSort = `${displayName},${dir}`;
            }
            // Khởi tạo query params từ DataTables
            let query: any = {
                page: Math.floor(data.start / data.length),
                size: data.length,
                sort: columnSort
            };

            // Duyệt toàn bộ key trong form và gán vào query
            if (form) {
                Object.keys(form).forEach((key) => {
                    const value = form[key];
                    if (value !== "" && value !== null && value !== undefined) {
                        query[key] = value;
                    }
                });
            }

            // Trả về object, jQuery sẽ tự encode thành query string
            return query;
        },
        dataFilter: (data: any) => {
            let json = JSON.parse(data);
            json.data.forEach((item: any, index: any) => {
                item.DT_RowId = `row_${index}`;
                const dataType = DATA_TYPE_ATTRIBUTE_CONFIG.find(c => c.value === item?.dataType);
                item['dataTypeName'] = dataType?.label;
            })
            let datatableRes: DatatableRes = {
                draw: json.data.draw,
                recordsTotal: json.total_elements,
                recordsFiltered: json.total_elements,
                data: json.data,
                COUNT: json.data?.COUNT
            }
            return JSON.stringify(datatableRes); // return JSON string
        },
        error: function (xhr: any, error: any, code: any) {
            if (xhr.responseJSON.message == "Khoảng thời gian khách hàng yêu cầu không được vượt quá 2 ngày") {
                alert("Hệ thống đang gặp sự cố, vui lòng nhập khoảng thời gian nhỏ hơn 2 ngày để tìm kiếm!")
                console.log(xhr, code);
            }
            console.log("🚀 ~ datatableAjax ~ xhr.responseJSON.message:", xhr.responseJSON.message)
            if (toastSvc && xhr.responseJSON.message) {
                toastSvc.showDanger(xhr.responseJSON.message)
            }

        }
    };
}

export function datatableAjaxUserIpConfig(url: string, accessToken: string, getFilterForm: () => any, method?: string, realm?: string, columnSortDefault?: string, idSrc?: string, toastSvc?: any, language?: any): any {
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
        ...(method === "POST"
            ? {
                contentType: "application/json", // định dạng body là JSON
                processData: false,
                data: (data: any) => {
                    let columnSort = columnSortDefault;
                    let sortBy = columnSortDefault;
                    let sortDir = 'DESC';
                    if (data.order && data.order.length > 0) {
                        const sort = data.order[0]; // lấy sort đầu tiên
                        const colIndex = sort.column;
                        sortDir = sort.dir.toUpperCase(); // ASC/DESC

                        const col = data.columns[colIndex];
                        sortBy = col.name || col.data; // ưu tiên name, fallback sang data
                    }
                    // Khởi tạo body với thông tin phân trang từ DataTables
                    let body: any = {
                        page: Math.floor(data.start / data.length),
                        size: data.length,
                        sortBy: sortBy,
                        sortDir: sortDir
                    };

                    // lấy filter mới nhất từ callback
                    const filter = getFilterForm();
                    if (filter) {
                        Object.keys(filter).forEach((key) => {
                            const value = filter[key];
                            if (value !== "" && value !== null && value !== undefined) {
                                body[key] = value;
                            }
                        });
                    }

                    return JSON.stringify(body);
                },
            }
            : {
                // GET: giữ nguyên data + merge filter
                data: (data: any) => {
                    let columnSort = columnSortDefault;
                    if (data.order && data.order.length > 0) {
                        const sort = data.order[0]; // lấy sort đầu tiên
                        const colIndex = sort.column;
                        const dir = sort.dir.toUpperCase(); // ASC/DESC

                        const col = data.columns[colIndex];
                        const displayName = col.name || col.data; // ưu tiên name, fallback sang data
                        columnSort = `${displayName},${dir}`;
                    }
                    // Khởi tạo query params từ DataTables
                    let query: any = {
                        page: Math.floor(data.start / data.length),
                        size: data.length,
                        sort: columnSort
                    };

                    // lấy filter mới nhất từ callback
                    const filter = getFilterForm();
                    if (filter) {
                        Object.keys(filter).forEach((key) => {
                            const value = filter[key];
                            if (value !== "" && value !== null && value !== undefined) {
                                query[key] = value;
                            }
                        });
                    }

                    // Trả về object, jQuery sẽ tự encode thành query string
                    return query;
                },
            }),
        dataFilter: (data: any) => {
            let json = JSON.parse(data);
            json.data.forEach((item: any, index: any) => {
                item.DT_RowId = `row_${index}`;
            })
            let datatableRes: DatatableRes = {
                draw: json.data?.draw,
                recordsTotal: json.total_elements || json.data?.length,
                recordsFiltered: json.total_elements || json.data?.length,
                data: json.data,
                COUNT: json.data?.COUNT
            }
            return JSON.stringify(datatableRes); // return JSON string
        },
        error: function (xhr: any, error: any, code: any) {
            if (xhr.responseJSON.message == "Khoảng thời gian khách hàng yêu cầu không được vượt quá 2 ngày") {
                alert("Hệ thống đang gặp sự cố, vui lòng nhập khoảng thời gian nhỏ hơn 2 ngày để tìm kiếm!")
                console.log(xhr, code);
            }
            console.log("🚀 ~ datatableAjax ~ xhr.responseJSON.message:", xhr.responseJSON.message)
            if (toastSvc && xhr.responseJSON.message) {
                toastSvc.showDanger(xhr.responseJSON.message)
            }

        }
    };
}

