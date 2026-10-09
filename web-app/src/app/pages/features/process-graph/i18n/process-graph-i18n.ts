import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import vi from './vi.json';
import en from './en.json';

/**
 * Bản dịch màn Canvas Builder (ngx-translate), key dưới `PROCESS_GRAPH.*` trong vi.json / en.json.
 * Template: {{ 'PROCESS_GRAPH.HEADER.SAVE_DRAFT' | translate }} · code: translate.instant(key).
 */
export const PROCESS_GRAPH_TRANSLATIONS: Record<string, any> = { vi, en };

export const PG_DEFAULT_LANG = 'vi';

/** Key localStorage lưu ngôn ngữ đang chọn (dùng chung cho cả app khi có bộ chọn ngôn ngữ) */
export const PG_LANG_STORAGE_KEY = 'app_lang';

/** Nạp bản dịch đồng bộ (import JSON) để translate.instant() dùng được ngay khi dựng canvas */
export class ProcessGraphTranslateLoader implements TranslateLoader {
  public getTranslation(lang: string): Observable<any> {
    return of(PROCESS_GRAPH_TRANSLATIONS[lang] || PROCESS_GRAPH_TRANSLATIONS[PG_DEFAULT_LANG]);
  }
}

/** Ngôn ngữ khởi tạo: lấy từ localStorage, không có thì tiếng Việt */
export function getInitialProcessGraphLang(): string {
  try {
    const lang = localStorage.getItem(PG_LANG_STORAGE_KEY);
    return lang && PROCESS_GRAPH_TRANSLATIONS[lang] ? lang : PG_DEFAULT_LANG;
  } catch {
    return PG_DEFAULT_LANG;
  }
}
