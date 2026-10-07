/**
 * Quản lý chọn nhiều hàng trong bảng (checkbox từng hàng + checkbox "chọn tất cả" ở header).
 *
 * - Lưu theo khoá (`keyFn`) nên chuyển trang / lọc lại vẫn giữ các hàng đã chọn.
 * - "Chọn tất cả" chỉ áp dụng cho các hàng đang hiển thị (`rows` truyền vào, thường là trang hiện tại),
 *   giống hành vi của antd Table.
 * - Header: `isAllSelected(rows)` → checked, `isSomeSelected(rows)` → indeterminate (dấu –).
 *
 * Dùng trong template:
 *   <ant-checkbox [ngModel]="selection.isAllSelected(rows)" [indeterminate]="selection.isSomeSelected(rows)"
 *                 (checkedChange)="selection.toggleAll(rows, $event)"></ant-checkbox>
 *   <ant-checkbox [ngModel]="selection.isSelected(row)" (checkedChange)="selection.toggle(row, $event)"></ant-checkbox>
 */
export class TableSelection<T, K = string> {
  private readonly selected = new Set<K>();

  /**
   * @param keyFn lấy khoá duy nhất của một hàng (vd: row => row.code)
   * @param isSelectable hàng nào được phép chọn (mặc định: tất cả)
   */
  constructor(
    private readonly keyFn: (row: T) => K,
    private readonly isSelectable: (row: T) => boolean = () => true
  ) {}

  /** Số hàng đang được chọn (tính cả các trang khác) */
  get count(): number {
    return this.selected.size;
  }

  get hasSelection(): boolean {
    return this.selected.size > 0;
  }

  /** Danh sách khoá đã chọn (theo thứ tự chọn) */
  get keys(): K[] {
    return Array.from(this.selected);
  }

  isSelected(row: T): boolean {
    return this.selected.has(this.keyFn(row));
  }

  canSelect(row: T): boolean {
    return this.isSelectable(row);
  }

  toggle(row: T, checked?: boolean): void {
    if (!this.isSelectable(row)) return;
    const key = this.keyFn(row);
    const next = checked ?? !this.selected.has(key);
    next ? this.selected.add(key) : this.selected.delete(key);
  }

  /** Tất cả hàng chọn được trong `rows` đều đã chọn (và có ít nhất 1 hàng) */
  isAllSelected(rows: T[]): boolean {
    const selectable = rows.filter(this.isSelectable);
    return selectable.length > 0 && selectable.every(row => this.isSelected(row));
  }

  /** Đã chọn một phần `rows` → header hiện trạng thái nửa chọn */
  isSomeSelected(rows: T[]): boolean {
    return !this.isAllSelected(rows) && rows.some(row => this.isSelected(row));
  }

  /** Chọn / bỏ chọn toàn bộ `rows`; không truyền `checked` thì đảo theo trạng thái hiện tại */
  toggleAll(rows: T[], checked?: boolean): void {
    const next = checked ?? !this.isAllSelected(rows);
    rows.filter(this.isSelectable).forEach(row => {
      const key = this.keyFn(row);
      next ? this.selected.add(key) : this.selected.delete(key);
    });
  }

  clear(): void {
    this.selected.clear();
  }

  /** Bỏ các khoá không còn trong dữ liệu (vd: sau khi xoá bản ghi) */
  retain(rows: T[]): void {
    const alive = new Set(rows.map(this.keyFn));
    this.selected.forEach(key => {
      if (!alive.has(key)) this.selected.delete(key);
    });
  }
}
