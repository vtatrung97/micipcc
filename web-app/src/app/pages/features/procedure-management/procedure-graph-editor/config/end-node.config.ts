import { SelectOption } from '@shared/components/ant-select/ant-select.component';

/**
 * Danh mục cho drawer node Kết thúc.
 * ⚠ Dữ liệu giả lập — chờ API danh mục biểu mẫu kết thúc.
 */

/** Biểu mẫu kết thúc: label là key i18n trong PROCESS_GRAPH.OPTIONS.END_FORMS */
export const END_FORM_KEYS: SelectOption[] = [
  { value: 'done', label: 'DONE' },
  { value: 'default', label: 'DEFAULT' },
  { value: 'close_pakn', label: 'CLOSE_PAKN' },
  { value: 'csat', label: 'CSAT' }
];

const RESULT_FIELDS: SelectOption[] = [
  { value: 'result', label: 'Kết quả xử lý' },
  { value: 'content', label: 'Nội dung' },
  { value: 'status', label: 'Trạng thái' }
];

/** Trường của từng biểu mẫu kết thúc */
export const END_FORM_FIELD_OPTIONS: Record<string, SelectOption[]> = {
  done: RESULT_FIELDS,
  default: RESULT_FIELDS,
  close_pakn: [...RESULT_FIELDS, { value: 'close_reason', label: 'Lý do đóng' }],
  csat: [
    { value: 'survey_score', label: 'Điểm hài lòng' },
    { value: 'survey_comment', label: 'Góp ý' }
  ]
};
