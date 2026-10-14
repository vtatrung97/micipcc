import { ProcessTemplateItem } from '@core/services/template.service';

export type ProcessStatus = ProcessTemplateItem['status'];

/** Cấu hình hiển thị của một trạng thái quy trình */
export interface ProcessStatusConfig {
  /** Nhãn badge trong bảng */
  label: string;
  /** Giá trị `status` truyền cho `app-status-tag appearance="fill"` → quyết định màu badge */
  badge: 'published' | 'inactive' | 'draft';
}

/**
 * 3 trạng thái quy trình và kiểu badge: Published nền xanh lá chữ trắng;
 * Inactive nền Neutral/500 chữ trắng; Draft nền Neutral/300 chữ Neutral/800.
 */
export const PROCESS_STATUS_CONFIG: Record<ProcessStatus, ProcessStatusConfig> = {
  Published: { label: 'Đang ban hành', badge: 'published' },
  Inactive: { label: 'Dừng ban hành', badge: 'inactive' },
  Draft: { label: 'Nháp', badge: 'draft' }
};

/** Thứ tự hiển thị trong bộ lọc */
export const PROCESS_STATUS_ORDER: ProcessStatus[] = ['Draft', 'Published', 'Inactive'];
