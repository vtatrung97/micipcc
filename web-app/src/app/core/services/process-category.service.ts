import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PROCESS_CATEGORIES, PROCESS_CATEGORY_MAX_LENGTH } from './process-category.constant';

const STORAGE_KEY = 'processx.customCategories.v1';

/**
 * Danh sách nhóm quy trình: nhóm có sẵn + nhóm người dùng tự thêm (lưu trên trình duyệt).
 * Dùng chung cho tab "Thông tin chung" và bộ lọc Danh sách quy trình.
 * ⚠ Chờ API danh mục — khi có API thì thay phần lưu localStorage.
 */
@Injectable({ providedIn: 'root' })
export class ProcessCategoryService {
  private readonly categoriesSubject = new BehaviorSubject<string[]>(this.load());
  readonly categories$: Observable<string[]> = this.categoriesSubject.asObservable();

  get categories(): string[] {
    return this.categoriesSubject.value;
  }

  /** Kiểm tra tên nhóm mới; trả về mã lỗi hoặc null nếu hợp lệ */
  validate(name: string): 'REQUIRED' | 'TOO_LONG' | 'DUPLICATE' | null {
    const value = name.trim();
    if (!value) return 'REQUIRED';
    if (value.length > PROCESS_CATEGORY_MAX_LENGTH) return 'TOO_LONG';
    const lower = value.toLowerCase();
    return this.categories.some((c) => c.toLowerCase() === lower) ? 'DUPLICATE' : null;
  }

  /** Thêm nhóm mới (đã validate); trả về tên đã chuẩn hoá */
  add(name: string): string {
    const value = name.trim();
    const custom = [...this.loadCustom(), value];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
    } catch {
      // localStorage không dùng được: vẫn giữ trong phiên hiện tại
    }
    this.categoriesSubject.next([...this.categories, value]);
    return value;
  }

  private load(): string[] {
    const custom = this.loadCustom().filter((c) => !PROCESS_CATEGORIES.includes(c));
    return [...PROCESS_CATEGORIES, ...custom];
  }

  private loadCustom(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }
}
