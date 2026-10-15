import { STATUS_ACCOUT, E_DATA_TYPE_ATTRIBUTE_CONFIG } from "@core/enums/users.enum";

export const ROLES: Array<{ name: string; value: number; classCss: string }> = [
    { value: 1, name: 'Điện thoại viên', classCss: 'vts-badge-dtv' },
    { value: 2, name: 'Giám sát', classCss: 'vts-badge-gs' },
    { value: 3, name: 'Trưởng ca', classCss: 'vts-badge-tc' },
    { value: 4, name: 'Admin', classCss: 'vts-badge-admin' }
];

export const STATUS: Array<{ name: string; value: number; classCss: string }> = [
    { value: STATUS_ACCOUT.KHONG_HOAT_DONG, name: 'Không hoạt động', classCss: 'vts-badge-inactive' },
    { value: STATUS_ACCOUT.HOAT_DONG, name: 'Hoạt động', classCss: 'vts-badge-active' },
    { value: STATUS_ACCOUT.BI_KHOA, name: 'Khóa tài khoản', classCss: 'vts-badge-error' },
    { value: STATUS_ACCOUT.TAM_KHOA, name: 'Tạm khóa', classCss: 'vts-badge-error' },
    { value: STATUS_ACCOUT.DANG_DONG_BO, name: 'Đang đồng bộ', classCss: 'vts-badge-warning' },
];

export const DATA_TYPE_ATTRIBUTE_CONFIG = [
    {value: E_DATA_TYPE_ATTRIBUTE_CONFIG.TEXT, label: 'Văn bản', htmlElement: 'input'},
    {value: E_DATA_TYPE_ATTRIBUTE_CONFIG.TEXTAREA, label: 'Văn bản dài', htmlElement: 'textarea'},
    {value: E_DATA_TYPE_ATTRIBUTE_CONFIG.SELECT, label: 'Danh sách chọn', htmlElement: 'select'},
    {value: E_DATA_TYPE_ATTRIBUTE_CONFIG.MULTI_SELECT, label: 'Danh sách chọn nhiều', htmlElement: 'multiselect'},
    {value: E_DATA_TYPE_ATTRIBUTE_CONFIG.NUMBER, label: 'Số', htmlElement: 'input'},
    {value: E_DATA_TYPE_ATTRIBUTE_CONFIG.DATE, label: 'Ngày', htmlElement: 'date'},
    // {value: E_DATA_TYPE_ATTRIBUTE_CONFIG.BOOLEAN, label: 'Bật/ Tắt', htmlElement: 'radio'},
]
