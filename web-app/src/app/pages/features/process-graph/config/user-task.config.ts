import { SelectOption } from '@shared/components/ant-select/ant-select.component';

/**
 * Danh mục cho drawer node Giao việc.
 * ⚠ Dữ liệu giả lập — chờ API danh mục phòng ban, nhóm, agent.
 */

/** Phòng ban: label là key i18n trong PROCESS_GRAPH.OPTIONS */
export const USER_TASK_DEPARTMENT_KEYS: SelectOption[] = [
  { value: 'cskh', label: 'DEPARTMENTS.CSKH' },
  { value: 'kt', label: 'DEPARTMENTS.KT' },
  { value: 'cuoc', label: 'DEPARTMENTS.CUOC' },
  { value: 'kd', label: 'DEPARTMENTS.KD' },
  { value: 'bh', label: 'DEPARTMENTS.BH' },
  { value: 'qa', label: 'DEPARTMENTS.QA' }
];

/** Nhóm thuộc phòng ban: label là key i18n trong PROCESS_GRAPH.OPTIONS */
export const USER_TASK_TEAMS: Array<{ value: string; label: string; departmentId: string }> = [
  { value: 'team_bo', label: 'TEAMS.BO', departmentId: 'cskh' },
  { value: 'team_vip', label: 'TEAMS.VIP', departmentId: 'cskh' },
  { value: 'team_l1', label: 'TEAMS.L1', departmentId: 'cskh' },
  { value: 'team_ftth', label: 'TEAMS.FTTH', departmentId: 'kt' },
  { value: 'team_l2', label: 'TEAMS.L2', departmentId: 'kt' },
  { value: 'team_outbound', label: 'TEAMS.OUTBOUND', departmentId: 'kd' }
];

/** Agent thuộc phòng ban (+ nhóm nếu có) */
export const USER_TASK_AGENTS: Array<{ value: string; label: string; departmentId: string; teamId: string | null }> = [
  { value: 'agent_01', label: 'Nguyễn Văn An', departmentId: 'cskh', teamId: 'team_bo' },
  { value: 'agent_02', label: 'Trần Thị Bình', departmentId: 'cskh', teamId: 'team_vip' },
  { value: 'agent_03', label: 'Lê Văn Cường', departmentId: 'cskh', teamId: 'team_l1' },
  { value: 'agent_10', label: 'Ngô Thị Mai', departmentId: 'cskh', teamId: 'team_bo' },
  { value: 'agent_04', label: 'Phạm Thị Dung', departmentId: 'kt', teamId: 'team_ftth' },
  { value: 'agent_05', label: 'Hoàng Văn Em', departmentId: 'kt', teamId: 'team_l2' },
  { value: 'agent_06', label: 'Vũ Thị Giang', departmentId: 'cuoc', teamId: null },
  { value: 'agent_07', label: 'Đặng Quốc Huy', departmentId: 'kd', teamId: 'team_outbound' },
  { value: 'agent_08', label: 'Bùi Thị Lan', departmentId: 'bh', teamId: null },
  { value: 'agent_09', label: 'Đỗ Minh Khoa', departmentId: 'qa', teamId: null }
];

/** Đơn vị Thời hạn xử lý (giá trị lưu là chuỗi tiếng Việt, khớp SLA_UNITS của mapper); mặc định Ngày */
export const USER_TASK_SLA_UNITS: Array<{ value: string; key: string }> = [
  { value: 'Giờ', key: 'HOUR' },
  { value: 'Ngày', key: 'DAY' },
  { value: 'Tuần', key: 'WEEK' },
  { value: 'Tháng', key: 'MONTH' }
];

/** Thời hạn xử lý: số nguyên 1 – 99999 */
export const USER_TASK_SLA_MAX = 99999;
