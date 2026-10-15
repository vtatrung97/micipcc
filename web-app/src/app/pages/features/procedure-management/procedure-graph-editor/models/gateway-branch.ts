import { ConditionBranch } from './node-property.model';

/** Hai nhánh cố định của node Điều kiện: luôn tồn tại, nằm cuối, không sửa / xoá được */
export const DEFAULT_BRANCH_ID = 'br-default';
export const ERROR_BRANCH_ID = 'br-error';

export interface FixedBranchLabels {
  defaultName: string;
  errorName: string;
}

export function isFixedBranch(branch: ConditionBranch | null | undefined): boolean {
  return !!(branch?.isDefault || branch?.isError);
}

/** Giữ thứ tự các nhánh thường, rồi Mặc định, rồi Lỗi ở cuối (tạo mới nếu thiếu) */
export function withFixedBranches(branches: ConditionBranch[] | undefined, labels: FixedBranchLabels): ConditionBranch[] {
  const list = branches || [];
  const custom = list.filter((b) => !isFixedBranch(b));
  const defaultBranch: ConditionBranch = list.find((b) => b.isDefault) || {
    id: DEFAULT_BRANCH_ID,
    name: labels.defaultName,
    value: 'default',
    expression: 'default',
    isDefault: true,
    rules: [],
  };
  const errorBranch: ConditionBranch = list.find((b) => b.isError) || {
    id: ERROR_BRANCH_ID,
    name: labels.errorName,
    value: 'error',
    expression: 'error',
    isError: true,
    rules: [],
  };
  return [...custom, defaultBranch, errorBranch];
}

/** Tên hiển thị của nhánh (dòng trên card, tiêu đề cổng, bảng nhánh) */
export function branchDisplayName(branch: ConditionBranch, index: number, labels: FixedBranchLabels & { branchN: (i: number) => string }): string {
  if (branch.isDefault) return labels.defaultName;
  if (branch.isError) return labels.errorName;
  return branch.name || branch.defaultLabel || labels.branchN(index + 1);
}
