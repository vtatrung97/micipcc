/** Các cột ẩn/hiện được của bảng "Danh sách quy trình" (STT và Hành động luôn hiện) */
export type ProcessColumnKey =
  | 'name'
  | 'code'
  | 'version'
  | 'status'
  | 'category'
  | 'createdDate'
  | 'createdBy'
  | 'updatedBy'
  | 'updatedDate'
  | 'publishedDate'
  | 'publishedBy'
  | 'trigger'
  | 'sla';

export interface ProcessColumn {
  key: ProcessColumnKey;
  label: string;
  /** Luôn hiện, không cho ẩn (ô tích bị khoá) */
  locked?: boolean;
}

/** Đúng thứ tự cột trong bảng (panel ẩn/hiện liệt kê theo thứ tự này); Tên + Mã quy trình luôn hiện */
export const PROCESS_COLUMNS: ProcessColumn[] = [
  { key: 'name', label: 'Tên quy trình', locked: true },
  { key: 'code', label: 'Mã quy trình', locked: true },
  { key: 'version', label: 'Phiên bản' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'category', label: 'Nhóm quy trình' },
  { key: 'createdDate', label: 'Ngày tạo' },
  { key: 'createdBy', label: 'Người tạo' },
  { key: 'updatedBy', label: 'Người cập nhật' },
  { key: 'updatedDate', label: 'Ngày cập nhật' },
  { key: 'publishedDate', label: 'Ngày ban hành' },
  { key: 'publishedBy', label: 'Người ban hành' },
  { key: 'trigger', label: 'Loại kích hoạt' },
  { key: 'sla', label: 'Thời hạn xử lý' }
];

/** Tiền tố key localStorage lưu các cột đang ẩn, nối thêm mã người dùng để lưu riêng từng người */
export const PROCESS_HIDDEN_COLUMNS_STORAGE_KEY = 'process-templates-list.hidden-columns';
