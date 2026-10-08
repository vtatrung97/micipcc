/** Các cột ẩn/hiện được của bảng "Danh sách quy trình" (STT và Hành động luôn hiện) */
export type ProcessColumnKey =
  | 'name'
  | 'code'
  | 'version'
  | 'status'
  | 'category'
  | 'trigger'
  | 'sla'
  | 'createdBy'
  | 'publishedBy'
  | 'createdDate'
  | 'publishedDate';

export interface ProcessColumn {
  key: ProcessColumnKey;
  label: string;
}

/** Thứ tự cột trong bảng và trong panel ẩn/hiện */
export const PROCESS_COLUMNS: ProcessColumn[] = [
  { key: 'name', label: 'Tên quy trình' },
  { key: 'code', label: 'Mã' },
  { key: 'version', label: 'Phiên bản' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'category', label: 'Nhóm quy trình' },
  { key: 'trigger', label: 'Loại kích hoạt' },
  { key: 'sla', label: 'SLA' },
  { key: 'createdBy', label: 'Người tạo' },
  { key: 'publishedBy', label: 'Người ban hành' },
  { key: 'createdDate', label: 'Ngày tạo' },
  { key: 'publishedDate', label: 'Ngày ban hành' }
];

/** Key localStorage lưu các cột đang ẩn (chỉ là tiện ích theo trình duyệt) */
export const PROCESS_HIDDEN_COLUMNS_STORAGE_KEY = 'process-templates-list.hidden-columns';
