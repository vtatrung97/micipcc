import { ProcessTemplateItem } from '@core/services/template.service';

export type ProcessStatus = ProcessTemplateItem['status'];

/** Cấu hình hiển thị của một trạng thái quy trình */
export interface ProcessStatusConfig {
  /** Nhãn badge trong bảng (Figma 243:11241) */
  label: string;
  /** Nhãn chip trong drawer "Bộ lọc nâng cao" (Figma 364:23413) */
  filterLabel: string;
  /** Giá trị `status` truyền cho `app-status-tag appearance="fill"` → quyết định màu badge */
  badge: 'published' | 'inactive' | 'draft';
}

/**
 * 3 trạng thái quy trình, mỗi trạng thái một kiểu badge:
 * - Published: nền xanh Actions/Green/300, chữ trắng
 * - Inactive : nền Neutral/500, chữ trắng
 * - Draft    : nền Neutral/300, chữ Neutral/800
 */
export const PROCESS_STATUS_CONFIG: Record<ProcessStatus, ProcessStatusConfig> = {
  Published: { label: 'Đang ban hành', filterLabel: 'Đang hiệu lực', badge: 'published' },
  Inactive: { label: 'Dừng ban hành', filterLabel: 'Tạm dừng', badge: 'inactive' },
  Draft: { label: 'Nháp', filterLabel: 'Chưa ban hành', badge: 'draft' }
};

/** Thứ tự hiển thị trong bộ lọc */
export const PROCESS_STATUS_ORDER: ProcessStatus[] = ['Published', 'Inactive', 'Draft'];
