import { SelectOption } from '@shared/components/ant-select/ant-select.component';

/**
 * Danh mục cho drawer node Giao việc.
 * ⚠ Dữ liệu giả lập — chờ API danh mục phòng ban, nhóm, agent.
 */

/** Phòng ban / Nhóm: label là key i18n trong PROCESS_GRAPH.OPTIONS */
export const USER_TASK_DEPARTMENT_KEYS: SelectOption[] = [
  { value: 'cskh', label: 'DEPARTMENTS.CSKH' },
  { value: 'kt', label: 'DEPARTMENTS.KT' },
  { value: 'cuoc', label: 'DEPARTMENTS.CUOC' }
];

export const USER_TASK_TEAM_KEYS: SelectOption[] = [
  { value: 'team_bo', label: 'TEAMS.BO' },
  { value: 'team_vip', label: 'TEAMS.VIP' },
  { value: 'team_ftth', label: 'TEAMS.FTTH' }
];

export const USER_TASK_AGENT_OPTIONS: SelectOption[] = [
  { value: 'agent_01', label: 'Nguyễn Văn An' },
  { value: 'agent_02', label: 'Trần Thị Bình' },
  { value: 'agent_03', label: 'Lê Văn Cường' }
];

/** Đơn vị Thời hạn xử lý (giá trị lưu là chuỗi tiếng Việt, khớp SLA_UNITS của mapper) */
export const USER_TASK_SLA_UNITS: Array<{ value: string; key: string }> = [
  { value: 'Giờ', key: 'HOUR' },
  { value: 'Ngày', key: 'DAY' },
  { value: 'Tuần', key: 'WEEK' }
];
