import { NodePropertyModel } from './node-property.model';

/** Giới hạn độ dài trường chung của drawer bước */
export const NODE_TEXT_LIMITS = {
  label: 255,
  nodeKey: 255,
  description: 500,
};

/** Mã bước: chỉ chữ không dấu, số và "_" */
export const NODE_KEY_PATTERN = /^[A-Za-z0-9_]+$/;

/** Lọc ký tự khi gõ mã bước */
export const nodeKeyFilter = (value: string): string => value.replace(/[^A-Za-z0-9_]/g, '');

/** Tên bước → mã bước: bỏ dấu, khoảng trắng thành "_", chữ thường (vd: "Giao việc phân loại" → "giao_viec_phan_loai") */
export function toNodeKey(label: string): string {
  return (label || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, NODE_TEXT_LIMITS.nodeKey);
}

/** Thêm hậu tố _2, _3… khi mã đã có trong quy trình */
export function uniqueNodeKey(base: string, existing: Iterable<string>): string {
  const used = new Set(Array.from(existing, (k) => (k || '').toLowerCase()));
  if (!used.has(base.toLowerCase())) return base;
  let i = 2;
  while (used.has(`${base}_${i}`.toLowerCase())) i++;
  return `${base}_${i}`;
}

/**
 * Đổi tên bước. Mã bước vẫn đang là mã tự sinh (trống / sinh từ tên cũ) thì sinh lại theo tên mới;
 * người dùng đã tự sửa mã thì giữ nguyên.
 */
export function applyLabelChange(props: NodePropertyModel, label: string): void {
  const key = props.nodeKey || '';
  const oldBase = toNodeKey(props.label);
  const isAuto = !key || !oldBase || key === oldBase || new RegExp(`^${oldBase}_\\d+$`).test(key);
  if (isAuto) props.nodeKey = toNodeKey(label);
  props.label = label;
}
