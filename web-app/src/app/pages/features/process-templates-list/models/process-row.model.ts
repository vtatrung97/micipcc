import { ProcessTemplateItem } from '@core/services/template.service';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu.component';

/** Một hàng của bảng "Danh sách quy trình" đã chuẩn hóa để hiển thị */
export interface ProcessRow {
  item: ProcessTemplateItem;
  versionLabel: string;
  statusKey: string;
  statusLabel: string;
  triggerLabel: string;
  slaLabel: string;
  createdDate: string;
  createdBy: string;
  updatedDate: string;
  updatedBy: string;
  publishedDate: string;
  publishedBy: string;
  menuItems: ActionMenuItem[];
}
