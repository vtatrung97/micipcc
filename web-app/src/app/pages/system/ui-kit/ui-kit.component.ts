import { Component } from '@angular/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import { ActionMenuItem } from '@shared/components/action-menu/action-menu.component';
import { TableSelection } from '@shared/utils/table-selection';

/** Mô tả một @Input/@Output của component để hiển thị bảng API */
interface ApiRow {
  name: string;
  type: string;
  defaultValue: string;
}

/** Một mục trong danh mục component (dùng cho mục lục + bảng API) */
interface ShowcaseSection {
  id: string;
  title: string;
  selector: string;
  description: string;
  api: ApiRow[];
}

@Component({
  selector: 'app-ui-kit',
  templateUrl: './ui-kit.component.html',
  styleUrls: ['./ui-kit.component.scss']
})
export class UiKitComponent {
  // ===== Ant Input =====
  inputBasic: string = '';
  inputPrefix: string = '';
  inputClear: string = 'Có thể xoá nhanh';
  inputCount: string = '';
  inputPassword: string = '';
  inputError: string = 'Giá trị sai';
  inputWarning: string = 'Cần kiểm tra';
  inputDisabled: string = 'Không cho sửa';
  inputReadonly: string = 'Chỉ đọc';
  lastEnterValue: string = '';

  // ===== Ant Select =====
  selectSimple: string | null = null;
  selectRich: string | null = 'running';
  selectSearch: string | null = null;
  simpleOptions: string[] = ['Nháp', 'Đang ban hành', 'Dừng ban hành'];
  richOptions: SelectOption[] = [
    { value: 'running', label: 'Đang chạy', dotColor: '#1677ff' },
    { value: 'completed', label: 'Hoàn thành', dotColor: '#16cf73' },
    { value: 'overdue', label: 'Trễ hạn SLA', dotColor: '#fa8c16', badge: 'SLA' },
    { value: 'failed', label: 'Thất bại', icon: 'close-circle', iconColor: '#ed0231' },
    { value: 'cancelled', label: 'Đã huỷ (disabled)', disabled: true }
  ];
  searchOptions: SelectOption[] = [
    { value: 'PAKN-2026', label: 'PAKN-2026 · Xử lý khiếu nại đa phòng ban' },
    { value: 'ALT-2026', label: 'ALT-2026 · Giám sát và cảnh báo chỉ số' },
    { value: 'SUR-2026', label: 'SUR-2026 · Khảo sát sau tương tác' }
  ];

  // ===== Date Picker =====
  dateSingle: string = '';
  datePrefilled: string = '2026-10-06';
  dateRange: { from: string; to: string } | null = null;
  dateRangePrefilled = { from: '2026-10-01', to: '2026-10-31' };
  lastDateChange: unknown = null;

  // ===== Textarea =====
  textareaValue: string = '';
  textareaCount: string = 'Mô tả ngắn cho bước xử lý.';

  // ===== Multi Select (field Agent) =====
  agentOptions: SelectOption[] = [
    { value: 'agent-01', label: 'Nguyễn Văn An' },
    { value: 'agent-02', label: 'Trần Thị Bình' },
    { value: 'agent-03', label: 'Lê Hoàng Cường' },
    { value: 'agent-04', label: 'Phạm Minh Đức' },
    { value: 'agent-05', label: 'Đỗ Thu Hà' },
    { value: 'agent-06', label: 'Vũ Quang Huy' },
    { value: 'agent-07', label: 'Bùi Thanh Hương (nghỉ phép)', disabled: true },
    { value: 'agent-08', label: 'Andi Lane' },
    { value: 'agent-09', label: 'Kate Morrison' },
    { value: 'agent-10', label: 'Koray Okumus' }
  ];
  outputOptions: SelectOption[] = Array.from({ length: 6 }, (_, i) => ({
    value: `output_${i + 1}`,
    label: `Output ${i + 1}`
  }));
  agentValue: string[] = [];
  agentPrefilled: string[] = ['agent-01', 'agent-02', 'agent-03', 'agent-04', 'agent-05'];
  outputValue: string[] = ['output_1', 'output_2'];

  // ===== Drawer "Giao việc" (demo field Agent trong ngữ cảnh) =====
  stepName: string = '';
  stepCode: string = 'ma_buoc';
  stepDescription: string = '';
  drawerAgents: string[] = [];
  drawerOutputs: string[] = ['output_1', 'output_2'];

  // ===== Quick filter + Drawer =====
  quickStatus: string = '';
  quickStatusOptions: SelectOption[] = [
    { value: '', label: 'Tất cả' },
    { value: 'Published', label: 'Đang hiệu lực' },
    { value: 'Inactive', label: 'Tạm dừng' },
    { value: 'Draft', label: 'Chưa ban hành' }
  ];
  drawerVisible: boolean = false;

  // ===== Month Day Picker =====
  monthDays: number[] = [7, 14, 21, 28];
  monthDaysEmpty: number[] = [];
  monthDaySingle: number | null = null;
  monthDaysLimited: number[] = [];

  // ===== Data table: chọn nhiều hàng =====
  /** Demo dùng chung 3 hàng cho mọi trang → khoá gồm cả số trang để thấy việc giữ lựa chọn khi chuyển trang */
  readonly tableSelection = new TableSelection<{ code: string }>(row => `${this.tablePage}:${row.code}`);

  /** Hàng đang hiển thị (trang hiện tại) — phạm vi của checkbox "chọn tất cả" */
  get visibleTableRows(): { code: string }[] {
    return this.tableEmpty ? [] : this.tableRows;
  }

  // ===== Data table: menu hành động "⋮" =====
  lastRowAction: string = '';
  /** Cache theo trạng thái để không tạo mảng mới mỗi vòng change detection */
  private readonly rowMenuCache: Record<string, ActionMenuItem[]> = {};

  rowMenuItems(row: { status: string }): ActionMenuItem[] {
    const isPublished = row.status === 'published';
    const key = isPublished ? 'published' : 'other';
    return this.rowMenuCache[key] ??= [
      { key: 'clone', label: 'Nhân bản' },
      { key: 'unpublish', label: 'Dừng ban hành', disabled: !isPublished },
      { key: 'delete', label: 'Xóa', danger: true }
    ];
  }

  onRowAction(key: string, row: { code: string }): void {
    const labels: Record<string, string> = { clone: 'Nhân bản', unpublish: 'Dừng ban hành', delete: 'Xóa' };
    this.lastRowAction = `${labels[key] || key} · ${row.code}`;
  }

  // ===== Radio =====
  triggerType: string = 'schedule';
  triggerOptions: SelectOption[] = [
    { value: 'manual', label: 'Kích hoạt thủ công' },
    { value: 'auto', label: 'Kích hoạt tự động' },
    { value: 'schedule', label: 'Lặp lịch' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'webhook', label: 'Webhook (disabled)', disabled: true }
  ];
  scheduleMode: string = 'once';
  scheduleModeOptions: SelectOption[] = [
    { value: 'once', label: 'Chạy một lần' },
    { value: 'repeat', label: 'Lặp lại' }
  ];
  scheduleDate: string = '';
  scheduleHour: string = '';
  scheduleMinute: string = '';
  radioSingle: boolean = false;
  // Hybrid: chọn API + biểu mẫu dữ liệu đầu vào
  hybridApi: string | null = null;
  hybridForm: string | null = null;
  hybridApiOptions: SelectOption[] = [
    { value: 'crm-ticket-create', label: 'CRM · Tạo ticket' },
    { value: 'crm-customer-sync', label: 'CRM · Đồng bộ khách hàng' },
    { value: 'billing-webhook', label: 'Billing · Webhook cước' }
  ];
  hybridFormOptions: SelectOption[] = [
    { value: 'form-complaint', label: 'Biểu mẫu khiếu nại' },
    { value: 'form-survey', label: 'Biểu mẫu khảo sát' }
  ];

  // ===== Checkbox =====
  checkboxStates = [
    { label: 'Default', disabled: false, readonly: false },
    { label: 'Disabled', disabled: true, readonly: false },
    { label: 'Read only', disabled: false, readonly: true }
  ];
  checkboxValues = [
    { checked: false, indeterminate: false },
    { checked: true, indeterminate: false },
    { checked: true, indeterminate: true }
  ];
  checkA: boolean = true;
  checkB: boolean = false;
  checkDisabled: boolean = true;
  checkAllItems = [
    { label: 'Email', checked: true },
    { label: 'SMS', checked: false },
    { label: 'Zalo OA', checked: true }
  ];

  // ===== Form Field =====
  formName: string = '';
  formCode: string = 'PAKN';

  // ===== Data Table / Pagination =====
  tableLoading: boolean = false;
  tableLoadingType: 'spinner' | 'dots' | 'skeleton' = 'spinner';
  tableEmpty: boolean = false;
  tablePage: number = 1;
  tablePageSize: number = 10;
  tableRows = [
    { code: 'PAKN-2026', name: 'Xử lý khiếu nại đa phòng ban', version: 'Phiên bản 1', status: 'draft', createdAt: '2026-02-10T09:30:00' },
    { code: 'ALT-2026', name: 'Giám sát và cảnh báo chỉ số', version: 'Phiên bản 3', status: 'published', createdAt: '2026-03-10T14:05:00' },
    { code: 'SUR-2026', name: 'Khảo sát sau tương tác', version: 'Phiên bản 2', status: 'inactive', createdAt: '2026-04-10T08:00:00' }
  ];
  pagerPage: number = 1;
  pagerPageSize: number = 10;

  // ===== Feedback =====
  confirmVisible: boolean = false;
  confirmType: 'danger' | 'warning' | 'info' = 'danger';
  confirmLoading: boolean = false;
  confirmResult: string = '';
  spinnerTypes: Array<'spinner' | 'dots' | 'skeleton'> = ['spinner', 'dots', 'skeleton'];
  spinnerSizes: Array<'small' | 'default' | 'large'> = ['small', 'default', 'large'];

  // ===== Hiển thị trạng thái =====
  statusList: string[] = [
    'published', 'active', 'draft', 'inactive', 'running', 'completed',
    'overdue', 'failed', 'exception', 'cancelled', 'archived'
  ];
  slaStatuses: Array<'normal' | 'warning' | 'danger' | 'overdue' | 'success'> = [
    'normal', 'warning', 'danger', 'overdue', 'success'
  ];
  iconNames: string[] = [
    'plus', 'edit', 'delete', 'copy', 'eye', 'history', 'search', 'reload', 'close',
    'user', 'team', 'calendar', 'clock-circle', 'check-circle', 'warning', 'info-circle',
    'setting', 'sync', 'inbox', 'lock', 'mail', 'file-text', 'branches', 'api',
    'check-circle-fill', 'close-circle-fill', 'warning-fill', 'info-circle-fill'
  ];

  // ===== Pipes =====
  pipeDate = new Date();
  slaMinutes: number[] = [120, 15, -45];
  safeHtmlSample: string = '<b>In đậm</b> và <span style="color:#ed0231">chữ đỏ</span>';

  readonly sections: ShowcaseSection[] = [
    {
      id: 'ant-input', title: 'Ô nhập liệu', selector: 'ant-input',
      description: 'Ô nhập text dùng ControlValueAccessor (ngModel / formControl).',
      api: [
        { name: 'type', type: 'string', defaultValue: "'text'" },
        { name: 'placeholder', type: 'string', defaultValue: "''" },
        { name: 'size', type: "'small' | 'middle' | 'large'", defaultValue: "'middle'" },
        { name: 'status', type: "'error' | 'warning' | ''", defaultValue: "''" },
        { name: 'prefixIcon / suffixIcon', type: 'string', defaultValue: '—' },
        { name: 'allowClear / showCount', type: 'boolean', defaultValue: 'false' },
        { name: 'maxLength', type: 'number', defaultValue: '—' },
        { name: 'disabled / readonly', type: 'boolean', defaultValue: 'false' },
        { name: '(onEnter) / (valueChange)', type: 'EventEmitter<string>', defaultValue: '—' }
      ]
    },
    {
      id: 'ant-textarea', title: 'Ô nhập nhiều dòng', selector: 'ant-textarea',
      description: 'Textarea theo "Text Area": cao 140px, radius 12, Inter Medium 16/24.',
      api: [
        { name: 'size', type: "'small' | 'middle' | 'large'", defaultValue: "'middle'" },
        { name: 'placeholder', type: 'string', defaultValue: "''" },
        { name: 'height', type: 'number (px)', defaultValue: '140' },
        { name: 'resizable', type: 'boolean', defaultValue: 'true' },
        { name: 'maxLength', type: 'number', defaultValue: '—' },
        { name: 'showCount', type: 'boolean', defaultValue: 'false' },
        { name: 'status', type: "'error' | 'warning' | ''", defaultValue: "''" },
        { name: 'disabled / readonly', type: 'boolean', defaultValue: 'false' },
        { name: '(valueChange)', type: 'EventEmitter<string>', defaultValue: '—' }
      ]
    },
    {
      id: 'multi-select', title: 'Chọn nhiều (field Agent)', selector: 'app-multi-select',
      description: 'Dropdown có ô tìm kiếm (bỏ dấu), "Chọn tất cả" (nửa chọn), checkbox từng mục; giá trị hiển thị dạng tag có nút xoá.',
      api: [
        { name: 'size', type: "'small' | 'middle' | 'large'", defaultValue: "'middle'" },
        { name: 'ngModel', type: 'any[] (value của option)', defaultValue: '[]' },
        { name: 'options', type: 'SelectOption[]', defaultValue: '[]' },
        { name: 'placeholder', type: 'string', defaultValue: "'Chọn tại đây'" },
        { name: 'searchPlaceholder', type: 'string', defaultValue: "'Tìm kiếm'" },
        { name: 'showSearch / showSelectAll', type: 'boolean', defaultValue: 'true' },
        { name: 'selectAllLabel / emptyText', type: 'string', defaultValue: "'Chọn tất cả' / 'Không có dữ liệu'" },
        { name: 'maxTagCount', type: 'number', defaultValue: '3' },
        { name: 'status', type: "'error' | 'warning' | ''", defaultValue: "''" },
        { name: 'disabled', type: 'boolean', defaultValue: 'false' },
        { name: '(valueChange)', type: 'EventEmitter<any[]>', defaultValue: '—' }
      ]
    },
    {
      id: 'quick-filter', title: 'Lọc nhanh (chip)', selector: 'app-quick-filter',
      description: 'Nhóm chip chọn một giá trị: chip active nền đỏ, chip thường viền xám.',
      api: [
        { name: 'ngModel', type: 'any (value của option)', defaultValue: 'null' },
        { name: 'options', type: 'SelectOption[]', defaultValue: '[]' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false' },
        { name: '(valueChange)', type: 'EventEmitter<any>', defaultValue: '—' }
      ]
    },
    {
      id: 'drawer', title: 'Drawer', selector: 'app-drawer',
      description: 'Khung drawer bên phải: header + body cuộn + footer chiếu qua [drawer-footer]. Bản thật: "Bộ lọc nâng cao" ở trang Danh sách quy trình.',
      api: [
        { name: 'visible', type: 'boolean', defaultValue: 'false' },
        { name: 'title', type: 'string', defaultValue: "''" },
        { name: 'width', type: 'number (px)', defaultValue: '500' },
        { name: 'maskClosable', type: 'boolean', defaultValue: 'true' },
        { name: '(closed)', type: 'EventEmitter<void>', defaultValue: '—' }
      ]
    },
    {
      id: 'field-agent', title: 'Drawer "Giao việc"', selector: 'demo ghép component',
      description: 'Dựng lại một phần drawer Giao việc bằng các component dùng chung, rộng 452px như design.',
      api: []
    },
    {
      id: 'ant-select', title: 'Ô chọn', selector: 'ant-select',
      description: 'Dropdown chọn một giá trị, nhận mảng string hoặc SelectOption.',
      api: [
        { name: 'options', type: '(SelectOption | string)[]', defaultValue: '[]' },
        { name: 'placeholder', type: 'string', defaultValue: "'Vui lòng chọn'" },
        { name: 'size', type: "'small' | 'middle' | 'large'", defaultValue: "'middle'" },
        { name: 'allowClear / showSearch / loading / disabled', type: 'boolean', defaultValue: 'false' },
        { name: 'prefixIcon', type: 'string', defaultValue: '—' },
        { name: '(valueChange)', type: 'EventEmitter<any>', defaultValue: '—' }
      ]
    },
    {
      id: 'date-picker', title: 'Chọn ngày', selector: 'app-date-picker',
      description: "Chọn một ngày ('YYYY-MM-DD') hoặc một khoảng ngày ({ from, to }).",
      api: [
        { name: 'size', type: "'small' | 'middle' | 'large'", defaultValue: "'middle'" },
        { name: 'isRange', type: 'boolean', defaultValue: 'false' },
        { name: 'placeholder', type: 'string', defaultValue: '—' },
        { name: 'startPlaceholder / endPlaceholder', type: 'string', defaultValue: '—' },
        { name: 'allowClear', type: 'boolean', defaultValue: 'true' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false' },
        { name: '(dateChange)', type: 'EventEmitter<any>', defaultValue: '—' }
      ]
    },
    {
      id: 'month-day-picker', title: 'Chọn ngày trong tháng', selector: 'app-month-day-picker',
      description: 'Lưới ngày 1 → 31 (không gắn tháng/năm), chọn một hoặc nhiều ngày. Theo design ProcessX "Ngày trong tháng".',
      api: [
        { name: 'size', type: "'small' | 'middle' | 'large'", defaultValue: "'middle'" },
        { name: 'ngModel', type: 'number[] (multiple) | number | null', defaultValue: '[]' },
        { name: 'multiple', type: 'boolean', defaultValue: 'true' },
        { name: 'placeholder', type: 'string', defaultValue: "'Chọn ngày'" },
        { name: 'disabledDays', type: 'number[]', defaultValue: '[]' },
        { name: 'placement', type: "'bottomLeft' | 'bottomRight'", defaultValue: "'bottomRight'" },
        { name: 'status', type: "'error' | 'warning' | ''", defaultValue: "''" },
        { name: 'allowClear', type: 'boolean', defaultValue: 'true' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false' },
        { name: '(valueChange)', type: 'EventEmitter<number[] | number | null>', defaultValue: '—' }
      ]
    },
    {
      id: 'radio', title: 'Radio', selector: 'app-radio-group · app-radio',
      description: 'Ô tròn 20px, chọn → nền đỏ + ✓ trắng; nhóm dọc cách 8 / ngang cách 32; nội dung mở rộng lùi 28px trong khung nền xám.',
      api: [
        { name: 'ngModel (group)', type: 'any (value của option)', defaultValue: 'null' },
        { name: 'options (group)', type: 'SelectOption[]', defaultValue: '[]' },
        { name: 'direction (group)', type: "'vertical' | 'horizontal'", defaultValue: "'vertical'" },
        { name: 'extraBoxed (group)', type: 'boolean', defaultValue: 'true' },
        { name: 'ng-template appRadioExtra (group)', type: 'let-option, let-checked', defaultValue: '—' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false' },
        { name: 'checked / label / description (radio lẻ)', type: 'boolean / string', defaultValue: '—' },
        { name: '(valueChange) / (selected)', type: 'EventEmitter', defaultValue: '—' }
      ]
    },
    {
      id: 'ant-checkbox', title: 'Checkbox', selector: 'ant-checkbox',
      description: '3 dạng Base / Label (+ mô tả) / Drag; trạng thái Default, Hover, Focused, Disabled, Read only; chưa chọn / đã chọn / nửa chọn.',
      api: [
        { name: 'ngModel', type: 'boolean', defaultValue: 'false' },
        { name: 'label', type: 'string (hoặc ng-content)', defaultValue: '— (không có → dạng Base)' },
        { name: 'description', type: 'string', defaultValue: '—' },
        { name: 'type', type: "'label' | 'drag'", defaultValue: "'label'" },
        { name: 'indeterminate', type: 'boolean', defaultValue: 'false' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false' },
        { name: 'readonly', type: 'boolean', defaultValue: 'false' },
        { name: '(checkedChange)', type: 'EventEmitter<boolean>', defaultValue: '—' }
      ]
    },
    {
      id: 'form-field', title: 'Khung trường form', selector: 'app-form-field',
      description: 'Bọc control bằng label, dấu bắt buộc, hint và thông báo lỗi (ng-content).',
      api: [
        { name: 'label', type: 'string', defaultValue: '—' },
        { name: 'required / colon', type: 'boolean', defaultValue: 'false' },
        { name: 'hint', type: 'string', defaultValue: '—' },
        { name: 'error', type: 'string', defaultValue: '—' }
      ]
    },
    {
      id: 'data-table', title: 'Bảng dữ liệu', selector: 'app-data-table',
      description: 'Khung bảng ProcessX (card bo 16, header 52, hàng 60 xen kẽ trắng/#F7F7F7, cột cuối cố định khi cuộn ngang). Chiếu <table> qua ng-content, tự hiển thị loading, empty state và pagination. Class trong cell: px-cell-check (checkbox + STT), px-cell-stack + px-cell-sub (2 dòng), px-cell-actions + px-cell-action-btn (nút icon 36×36).',
      api: [
        { name: 'loading', type: 'boolean', defaultValue: 'false' },
        { name: 'loadingType', type: "'spinner' | 'dots' | 'skeleton'", defaultValue: "'spinner'" },
        { name: 'loadingTip / loadingColor', type: 'string', defaultValue: '…' },
        { name: 'total / page / pageSize', type: 'number', defaultValue: '0 / 1 / 10' },
        { name: 'pageSizeOptions', type: 'number[]', defaultValue: '[10, 20, 50, 100]' },
        { name: 'showPagination', type: 'boolean', defaultValue: 'true' },
        { name: 'fixedLastColumn', type: 'boolean', defaultValue: 'true' },
        { name: 'striped', type: 'boolean', defaultValue: 'true' },
        { name: 'emptyTitle / emptyDescription', type: 'string', defaultValue: '—' },
        { name: '(onPageChange) / (onPageSizeChange)', type: 'EventEmitter<number>', defaultValue: '—' },
        { name: 'Cột Hành động', type: 'button.px-cell-action-btn (Sửa, Xem) + <app-action-menu> (⋮)', defaultValue: '—' }
      ]
    },
    {
      id: 'tooltip', title: 'Tooltip', selector: '[appTooltip] · app-help-tooltip',
      description: 'Bong bóng nền đen chữ trắng có mũi tên + icon "?" 16px. Gắn vào <body> nên không bị overflow cắt; thiếu chỗ thì tự lật cạnh.',
      api: [
        { name: 'appTooltip', type: 'string (\\n để xuống dòng)', defaultValue: "''" },
        { name: 'tooltipPlacement', type: "'top' | 'bottom' | 'left' | 'right'", defaultValue: "'top'" },
        { name: 'tooltipMaxWidth', type: 'number (px)', defaultValue: '320' },
        { name: 'tooltipDelay', type: 'number (ms)', defaultValue: '100' },
        { name: 'tooltipDisabled', type: 'boolean', defaultValue: 'false' },
        { name: 'tooltipOnlyTruncated', type: 'boolean', defaultValue: 'false' },
        { name: 'app-help-tooltip: text / placement / maxWidth', type: 'string / placement / number', defaultValue: '—' }
      ]
    },
    {
      id: 'action-menu', title: 'Menu hành động (⋮)', selector: 'app-action-menu',
      description: 'Nút ⋮ trong cột Hành động, mở menu Nhân bản / Dừng ban hành / Xóa. Menu position: fixed nên không bị bảng cuộn ngang cắt; căn phải theo nút, thiếu chỗ thì mở lên trên.',
      api: [
        { name: 'items', type: 'ActionMenuItem[] { key, label, icon?, danger?, disabled? }', defaultValue: '[]' },
        { name: 'disabled', type: 'boolean', defaultValue: 'false' },
        { name: 'title', type: 'string', defaultValue: "'Thêm hành động'" },
        { name: '(action)', type: 'EventEmitter<string> (key)', defaultValue: '—' }
      ]
    },
    {
      id: 'pagination', title: 'Phân trang', selector: 'app-pagination',
      description: 'Phân trang ProcessX: "Số dòng hiển thị" + dropdown, "1 - 10 / N kết quả", dãy trang 1 2 3 … n-2 n-1 n với trang đang chọn viền đỏ.',
      api: [
        { name: 'total / page / pageSize', type: 'number', defaultValue: '0 / 1 / 10' },
        { name: 'pageSizeOptions', type: 'number[]', defaultValue: '[10, 20, 50, 100]' },
        { name: 'showSizeChanger / showTotal', type: 'boolean', defaultValue: 'true' },
        { name: '(pageChange) / (pageSizeChange)', type: 'EventEmitter<number>', defaultValue: '—' }
      ]
    },
    {
      id: 'status-tag', title: 'Tag trạng thái', selector: 'app-status-tag',
      description: 'Tag màu theo trạng thái, tự dịch nhãn tiếng Việt.',
      api: [
        { name: 'status', type: 'string', defaultValue: "'active'" },
        { name: 'text', type: 'string', defaultValue: '(nhãn tự map)' },
        { name: 'dot', type: 'boolean', defaultValue: 'true' },
        { name: 'size', type: "'small' | 'middle'", defaultValue: "'middle'" }
      ]
    },
    {
      id: 'sla-badge', title: 'Badge SLA', selector: 'app-sla-badge',
      description: 'Badge cảnh báo SLA, có thể nhấp nháy (pulse).',
      api: [
        { name: 'status', type: "'normal' | 'warning' | 'danger' | 'overdue' | 'success'", defaultValue: "'normal'" },
        { name: 'count', type: 'number', defaultValue: '—' },
        { name: 'text', type: 'string', defaultValue: '—' },
        { name: 'isPulse / showDot', type: 'boolean', defaultValue: 'false / true' }
      ]
    },
    {
      id: 'ant-icon', title: 'Icon', selector: 'ant-icon',
      description: 'Icon Ant Design (đã đăng ký sẵn trong AntIconComponent).',
      api: [
        { name: 'name', type: 'string', defaultValue: "''" },
        { name: 'theme', type: "'outline' | 'fill'", defaultValue: "'outline'" },
        { name: 'size', type: 'number | string', defaultValue: '—' },
        { name: 'color', type: 'string', defaultValue: '—' },
        { name: 'spin', type: 'boolean', defaultValue: 'false' },
        { name: 'rotate', type: 'number', defaultValue: '—' }
      ]
    },
    {
      id: 'breadcrumbs', title: 'Breadcrumb', selector: 'app-breadcrumbs',
      description: 'Đường dẫn điều hướng dạng text.',
      api: [{ name: 'items', type: 'string[]', defaultValue: "['IPCC 2.0']" }]
    },
    {
      id: 'loading-spinner', title: 'Loading', selector: 'app-loading-spinner',
      description: 'Spinner / dots / skeleton, có thể phủ toàn màn hình.',
      api: [
        { name: 'loading / showTip', type: 'boolean', defaultValue: 'true' },
        { name: 'type', type: "'spinner' | 'dots' | 'skeleton'", defaultValue: "'spinner'" },
        { name: 'size', type: "'small' | 'default' | 'large'", defaultValue: "'default'" },
        { name: 'tip / color / iconName', type: 'string', defaultValue: '…' },
        { name: 'fullScreen / showSkeletonAvatar', type: 'boolean', defaultValue: 'false' },
        { name: 'skeletonRows', type: 'number', defaultValue: '3' }
      ]
    },
    {
      id: 'empty-state', title: 'Trạng thái rỗng', selector: 'app-empty-state',
      description: 'Khối hiển thị khi không có dữ liệu, có nút hành động tuỳ chọn.',
      api: [
        { name: 'icon', type: 'string', defaultValue: "'inbox'" },
        { name: 'title / description', type: 'string', defaultValue: '…' },
        { name: 'actionText', type: 'string', defaultValue: '—' },
        { name: '(onAction)', type: 'EventEmitter<void>', defaultValue: '—' }
      ]
    },
    {
      id: 'confirm-dialog', title: 'Hộp thoại xác nhận', selector: 'app-confirm-dialog',
      description: 'Modal xác nhận có 3 kiểu danger / warning / info.',
      api: [
        { name: 'visible / loading', type: 'boolean', defaultValue: 'false' },
        { name: 'type', type: "'danger' | 'warning' | 'info'", defaultValue: "'danger'" },
        { name: 'title / content', type: 'string', defaultValue: '…' },
        { name: 'confirmText / cancelText', type: 'string', defaultValue: '—' },
        { name: '(onConfirm) / (onCancel)', type: 'EventEmitter<void>', defaultValue: '—' }
      ]
    },
    {
      id: 'pipes', title: 'Pipes', selector: 'dateFormat · slaStatus · safeHtml',
      description: 'Pipe dùng chung khai báo trong SharedModule.',
      api: [
        { name: 'dateFormat', type: 'string | Date | number → string', defaultValue: "'dd/MM/yyyy HH:mm'" },
        { name: 'slaStatus', type: 'number (phút còn lại) → string', defaultValue: '—' },
        { name: 'safeHtml', type: 'string → SafeHtml', defaultValue: '—' }
      ]
    }
  ];

  /** Lấy section theo id để render header + bảng API */
  section(id: string): ShowcaseSection {
    return this.sections.find(s => s.id === id) as ShowcaseSection;
  }

  scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ===== Checkbox: chọn tất cả =====
  get allChecked(): boolean {
    return this.checkAllItems.every(i => i.checked);
  }

  get someChecked(): boolean {
    return this.checkAllItems.some(i => i.checked) && !this.allChecked;
  }

  toggleAll(checked: boolean): void {
    this.checkAllItems.forEach(i => (i.checked = checked));
  }

  // ===== Form Field: validate demo =====
  get formNameError(): string {
    return this.formName.trim() ? '' : 'Tên quy trình là bắt buộc';
  }

  // ===== Data Table =====
  get tableTotal(): number {
    return this.tableEmpty ? 0 : 1080;
  }

  simulateTableLoading(): void {
    this.tableLoading = true;
    setTimeout(() => (this.tableLoading = false), 1500);
  }

  // ===== Confirm Dialog =====
  openConfirm(type: 'danger' | 'warning' | 'info'): void {
    this.confirmType = type;
    this.confirmResult = '';
    this.confirmVisible = true;
  }

  onConfirm(): void {
    this.confirmLoading = true;
    setTimeout(() => {
      this.confirmLoading = false;
      this.confirmVisible = false;
      this.confirmResult = `Đã xác nhận (${this.confirmType})`;
    }, 800);
  }

  onCancelConfirm(): void {
    this.confirmVisible = false;
    this.confirmResult = 'Đã huỷ';
  }

  toJson(value: unknown): string {
    return JSON.stringify(value);
  }
}
