import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  TemplateService,
  ProcessTemplateItem,
  TemplateVersionItem,
  TemplateExperimentConfig
} from '@core/services/template.service';
import { RbacService } from '@core/rbac/services/rbac.service';
import { UserSession } from '@core/rbac/models/rbac.types';
import { ScopeService, AuthService, TokenService } from '@core/auth';
import { KEYCLOAK } from '@environments/environment';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import {
  ProcessAdvancedFilter,
  EMPTY_ADVANCED_FILTER,
  countAdvancedFilter
} from './components/advanced-filter-drawer/advanced-filter-drawer.component';

@Component({
  selector: 'app-process-templates-list',
  templateUrl: './process-templates-list.component.html',
  styleUrls: ['./process-templates-list.component.scss']
})
export class ProcessTemplatesListComponent implements OnInit, OnDestroy {
  allTemplates: ProcessTemplateItem[] = [];
  searchKeyword: string = '';
  selectedStatus: string = '';
  selectedCategory: string = '';
  selectedOrg: string = '';

  // Bộ lọc nâng cao (drawer "Bộ lọc nâng cao")
  showAdvancedFilter: boolean = false;
  advancedFilter: ProcessAdvancedFilter = { ...EMPTY_ADVANCED_FILTER };

  currentUser: UserSession | null = null;
  private sub = new Subscription();

  // Danh mục phân loại chuẩn
  categories: string[] = [
    'Xử lý khiếu nại',
    'Cảnh báo chỉ số',
    'Chăm sóc sau tương tác',
    'Happy Call / Telesales',
    'Khảo sát CSAT'
  ];

  // Đơn vị / Phòng ban chuẩn
  departments: { id: string; name: string }[] = [
    { id: 'ORG_CSKH_MB', name: 'TT CSKH Miền Bắc' },
    { id: 'ORG_CSKH_MN', name: 'TT CSKH Miền Nam' },
    { id: 'ORG_KT_BROADBAND', name: 'Phòng Kỹ thuật Broadband' },
    { id: 'ORG_BILLING', name: 'Trung tâm Đối soát & Tính cước' },
    { id: 'ORG_TELESALES', name: 'Phòng Kinh doanh & Telesales' }
  ];

  // Phân trang
  page: number = 1;
  pageSize: number = 10;

  statusFilterOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'Published', label: 'Đang hoạt động (PUBLISHED)' },
    { value: 'Draft', label: 'Bản nháp (DRAFT)' },
    { value: 'Inactive', label: 'Tạm dừng (INACTIVE)' }
  ];

  get categoryFilterOptions() {
    return [
      { value: '', label: 'Tất cả danh mục nghiệp vụ' },
      ...this.categories.map(c => ({ value: c, label: c }))
    ];
  }

  get orgFilterOptions() {
    return [
      { value: '', label: 'Tất cả đơn vị / phòng ban' },
      ...this.departments.map(d => ({ value: d.id, label: d.name }))
    ];
  }

  get categoryModalOptions() {
    return this.categories.map(c => ({ value: c, label: c }));
  }

  get orgModalOptions() {
    return this.departments.map(d => ({ value: d.id, label: d.name }));
  }

  slaModalOptions = [
    { value: '1h SLA', label: '1h SLA (Khẩn cấp)' },
    { value: '2h SLA', label: '2h SLA (Ưu tiên cao)' },
    { value: '4h SLA', label: '4h SLA (Tiêu chuẩn)' },
    { value: '8h SLA', label: '8h SLA (Trong ngày)' },
    { value: '24h SLA', label: '24h SLA (Thường kỳ)' }
  ];

  // Modal 1: Tạo mới (FR-01, US-01)
  showCreateModal: boolean = false;
  newTemplateName: string = '';
  newTemplateCode: string = '';
  newTemplateCategory: string = 'Xử lý khiếu nại';
  newTemplateOrgId: string = 'ORG_CSKH_MB';
  newTemplateSla: string = '2h SLA';
  newTemplateDesc: string = '';
  initTemplateType: 'blank' | 'telecom' | 'clone' = 'blank';
  selectedCloneSourceCode: string = 'PRC_COMPLAINT_BILLING';

  // Modal 2: Nhân bản (FR-10)
  showCloneModal: boolean = false;
  targetCloneItem: ProcessTemplateItem | null = null;
  cloneNewName: string = '';
  cloneNewCode: string = '';
  cloneDesc: string = '';

  // Modal 3: Bật / Tắt trạng thái (FR-08)
  showToggleModal: boolean = false;
  targetToggleItem: ProcessTemplateItem | null = null;

  // Modal 4: Xóa quy trình (FR-09)
  showDeleteModal: boolean = false;
  targetDeleteItem: ProcessTemplateItem | null = null;
  isDeleteBlocked: boolean = false;

  // Modal 5: Xem lịch sử phiên bản
  showVersionModal: boolean = false;
  targetVersionItem: ProcessTemplateItem | null = null;

  // Modal 6: Thử nghiệm A/B Testing (FR-25)
  showExperimentModal: boolean = false;
  experiments: TemplateExperimentConfig[] = [];
  newExpTemplateCode: string = 'PRC_COMPLAINT_BILLING';
  newExpVersionA: string = 'V2.1 (Hiện tại)';
  newExpVersionB: string = 'V2.2 (Thử nghiệm)';
  newExpRatioA: number = 50;
  newExpMetric: string = 'FCR (Tỷ lệ xử lý ngay lần đầu)';

  isLoading: boolean = false;

  constructor(
    private templateService: TemplateService,
    private rbacService: RbacService,
    private scopeService: ScopeService,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // === NẠP UMA AUTHORIZATION PERMISSIONS VÀ KIỂM TRA GET SCOPE ===
    this.tokenService.initAuthorizationList().finally(() => {
      this.logScopeDetails();
    });

    this.sub.add(
      this.templateService.templates$.subscribe(list => {
        this.allTemplates = list;
      })
    );

    this.sub.add(
      this.templateService.experiments$.subscribe(expList => {
        this.experiments = expList;
      })
    );

    this.sub.add(
      this.rbacService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    // Gọi API nạp danh sách template từ backend
    this.loadTemplates();
  }

  /**
   * Log chi tiết kiểm tra Scopes (Client-level vs Realm-level) từ Access Token
   */
  private logScopeDetails(): void {
    const rawToken = TokenService.getAccessToken();
    const decoded = TokenService.decodeToken(rawToken);
    const clientId = KEYCLOAK.clientId || 'agent-web';

    console.group('%c=== [ProcessTemplatesList] KIỂM TRA GET SCOPE: CLIENT vs REALM ===', 'color: #1890ff; font-weight: bold; font-size: 13px;');
    console.log('%c1. Thông tin cấu hình Keycloak:', 'font-weight: bold; color: #722ed1;', {
      endpoint: KEYCLOAK.endpoint,
      realm: KEYCLOAK.realm,
      clientId: clientId
    });

    console.log('%c2. Trạng thái Access Token:', 'font-weight: bold; color: #13c2c2;', {
      hasToken: !!rawToken,
      tokenPreview: rawToken ? `${rawToken.substring(0, 25)}...` : 'Không tìm thấy Token'
    });

    console.log('%c3. Payload JWT đã giải mã (Decoded):', 'font-weight: bold; color: #fa8c16;', decoded);

    console.group('%c4. [REALM / TOKEN LEVEL] Scopes & Roles:', 'font-weight: bold; color: #52c41a;');
    console.log('• OAuth2 standard scope (decoded.scope):', decoded?.scope);
    console.log('• ScopeService.getScopes():', this.scopeService.getScopes());
    console.log('• AuthService.getScopes():', this.authService.getScopes());
    console.log('• Realm Roles (decoded.realm_access.roles):', decoded?.realm_access?.roles);
    console.groupEnd();

    console.group(`%c5. [CLIENT LEVEL] Scopes & Roles (Client: ${clientId} & Services):`, 'font-weight: bold; color: #eb2f96;');
    console.log(`• TokenService.getListScopes('${clientId}'):`, TokenService.getListScopes(clientId));
    console.log(`• TokenService.getListScopes('ticket-flow'):`, TokenService.getListScopes('ticket-flow'));
    console.log('• UMA User Permissions (this.tokenService._permissions):', this.tokenService._permissions);
    console.log('• Client Resource Access (decoded.resource_access):', decoded?.resource_access);
    console.log('• Resource Permissions (Keycloak Authorization):', decoded?.authorization?.permissions);
    console.log('• ScopeService.getKeycloakPermissions():', this.scopeService.getKeycloakPermissions());
    console.groupEnd();

    console.log('%c6. Tổng hợp Roles đầy đủ (AuthService.getUserRoles):', 'font-weight: bold; color: #1890ff;', this.authService.getUserRoles());
    console.groupEnd();
  }

  loadTemplates(): void {
    this.isLoading = true;
    this.templateService.fetchTemplatesFromApi().subscribe({
      next: (list) => {
        this.allTemplates = list || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách template từ API:', err);
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  // ============================================================================
  // RBAC PERMISSION GETTERS (REQ-04)
  // ============================================================================
  get canCreate(): boolean {
    return this.rbacService.hasPermission('Template', 'create');
  }

  get canEdit(): boolean {
    return this.rbacService.hasPermission('Template', 'edit');
  }

  get canDelete(): boolean {
    return this.rbacService.hasPermission('Template', 'delete');
  }

  get canToggle(): boolean {
    return this.rbacService.hasPermission('Template', 'edit');
  }

  // ============================================================================
  // FILTERING LOGIC
  // ============================================================================
  get filteredTemplates(): ProcessTemplateItem[] {
    return this.allTemplates.filter(item => {
      const matchKeyword = !this.searchKeyword.trim() ||
        item.code.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        item.name.toLowerCase().includes(this.searchKeyword.toLowerCase());

      const matchStatus = !this.selectedStatus || item.status === this.selectedStatus;
      const matchCategory = !this.selectedCategory || item.category === this.selectedCategory;
      const matchOrg = !this.selectedOrg || item.owner_org_id === this.selectedOrg;

      return matchKeyword && matchStatus && matchCategory && matchOrg && this.matchAdvanced(item);
    });
  }

  get paginatedTemplates(): ProcessTemplateItem[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredTemplates.slice(start, start + this.pageSize);
  }

  get hasActiveFilter(): boolean {
    return !!(this.searchKeyword || this.selectedStatus || this.selectedCategory || this.selectedOrg) ||
      this.advancedFilterCount > 0;
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.selectedStatus = '';
    this.selectedCategory = '';
    this.selectedOrg = '';
    this.advancedFilter = { ...EMPTY_ADVANCED_FILTER };
    this.page = 1;
  }

  // ===== Bộ lọc nâng cao =====
  get advancedFilterCount(): number {
    return countAdvancedFilter(this.advancedFilter);
  }

  /** Phiên bản hiệu lực đang tồn tại thực tế trong danh sách */
  get versionOptions(): SelectOption[] {
    const versions = Array.from(new Set(this.allTemplates.map(t => t.version).filter(Boolean)));
    return versions
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map(v => ({ value: v, label: v }));
  }

  applyAdvancedFilter(filter: ProcessAdvancedFilter): void {
    this.advancedFilter = filter;
    this.showAdvancedFilter = false;
    this.page = 1;
  }

  private matchAdvanced(item: ProcessTemplateItem): boolean {
    const f = this.advancedFilter;
    const includes = (text: string | undefined, kw: string) =>
      !kw || (text || '').toLowerCase().includes(kw.toLowerCase());

    const hasDraft = item.status === 'Draft' || (item.versions || []).some(v => v.status === 'Draft');
    const hasIssue = item.slaStatus === 'overdue' || item.slaStatus === 'danger';

    return includes(item.name, f.name)
      && includes(item.code, f.code)
      && (!f.version || item.version === f.version)
      && (!f.status || item.status === f.status)
      && (!f.draft || (f.draft === 'yes') === hasDraft)
      && (!f.operation || hasIssue)
      && (!f.updatedDate || this.toIsoDate(item.updatedAt) === f.updatedDate)
      && (!f.publishedDate || this.toIsoDate(item.published_at) === f.publishedDate);
  }

  /** 'DD/MM/YYYY HH:mm' → 'YYYY-MM-DD' */
  private toIsoDate(value?: string): string {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(value || '');
    return m ? `${m[3]}-${m[2]}-${m[1]}` : '';
  }

  countByStatus(status: 'Published' | 'Draft' | 'Inactive'): number {
    return this.allTemplates.filter(t => t.status === status).length;
  }

  get activeExperimentsCount(): number {
    return this.experiments.filter(e => e.status === 'running').length;
  }

  getCategoryClass(category?: string): string {
    switch (category) {
      case 'Xử lý khiếu nại': return 'cat-complaint';
      case 'Cảnh báo chỉ số': return 'cat-alert';
      case 'Chăm sóc sau tương tác': return 'cat-followup';
      case 'Happy Call / Telesales': return 'cat-telesales';
      case 'Khảo sát CSAT': return 'cat-survey';
      default: return 'cat-default';
    }
  }

  // ============================================================================
  // 1. TẠO MỚI QUY TRÌNH (FR-01, US-01)
  // ============================================================================
  /**
   * "Tạo mới quy trình": mở thẳng Canvas Builder ở tab "Thông tin chung" để nhập thông tin
   * (Figma 264:42051). Bản ghi chỉ được tạo khi bấm Lưu nháp / Ban hành và form hợp lệ.
   */
  openCreateProcess(): void {
    this.router.navigate(['/process/graph'], {
      queryParams: { mode: 'create', initType: 'blank' }
    });
  }

  /** Modal tạo nhanh cũ (giữ lại, hiện không còn nút nào mở) */
  openCreateModal(): void {
    const nextNum = this.allTemplates.length + 1;
    this.newTemplateCode = `PRC_FLOW_${String(nextNum).padStart(3, '0')}`;
    this.newTemplateName = '';
    this.newTemplateCategory = 'Xử lý khiếu nại';
    this.newTemplateOrgId = 'ORG_CSKH_MB';
    this.newTemplateSla = '2h SLA';
    this.newTemplateDesc = '';
    this.initTemplateType = 'blank';
    this.selectedCloneSourceCode = this.allTemplates[0]?.code || '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  onNewNameChange(): void {
    if (!this.newTemplateCode || this.newTemplateCode.startsWith('PRC_FLOW_')) {
      const clean = this.newTemplateName
        .toUpperCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .slice(0, 16);
      if (clean) {
        this.newTemplateCode = `PRC_${clean}`;
      }
    }
  }

  confirmCreateAndNavigate(): void {
    if (!this.newTemplateName.trim()) return;

    const orgObj = this.departments.find(d => d.id === this.newTemplateOrgId);
    let initialGraphData: any = null;

    if (this.initTemplateType === 'clone' && this.selectedCloneSourceCode) {
      const source = this.templateService.getTemplateByCode(this.selectedCloneSourceCode);
      if (source && source.graphData) {
        initialGraphData = JSON.parse(JSON.stringify(source.graphData));
      }
    }

    const created = this.templateService.createTemplate({
      code: this.newTemplateCode.trim().toUpperCase(),
      name: this.newTemplateName.trim(),
      category: this.newTemplateCategory,
      owner_org_id: this.newTemplateOrgId,
      owner_org_name: orgObj?.name || 'TT CSKH Miền Bắc',
      sla: this.newTemplateSla || '2h SLA',
      slaStatus: 'normal',
      status: 'Draft',
      version: 'V1.0',
      description: this.newTemplateDesc.trim() || 'Quy trình khởi tạo mới',
      graphData: initialGraphData
    });

    this.closeCreateModal();

    // Điều hướng sang Canvas Builder kèm ID/Code vừa tạo
    this.router.navigate(['/process/graph'], {
      queryParams: {
        id: created.code,
        mode: 'create',
        initType: this.initTemplateType === 'clone' ? 'loaded' : this.initTemplateType
      }
    });
  }

  // ============================================================================
  // 2. CHỈNH SỬA QUY TRÌNH TRÊN CANVAS BUILDER (FR-07)
  // ============================================================================
  editOnCanvas(item: ProcessTemplateItem): void {
    this.router.navigate(['/process/graph'], {
      queryParams: {
        id: item.code
      }
    });
  }

  // ============================================================================
  // 3. BẬT / TẮT TRẠNG THÁI (FR-08)
  // ============================================================================
  confirmToggleStatus(item: ProcessTemplateItem): void {
    this.targetToggleItem = item;
    this.showToggleModal = true;
  }

  closeToggleModal(): void {
    this.showToggleModal = false;
    this.targetToggleItem = null;
  }

  executeToggleStatus(): void {
    if (!this.targetToggleItem) return;
    this.templateService.toggleStatus(this.targetToggleItem.code);
    this.closeToggleModal();
  }

  // ============================================================================
  // 4. NHÂN BẢN QUY TRÌNH (FR-10)
  // ============================================================================
  openCloneModal(item: ProcessTemplateItem): void {
    this.targetCloneItem = item;
    this.cloneNewName = `${item.name} (Bản sao)`;
    this.cloneNewCode = `${item.code}_V2`;
    this.cloneDesc = `Nhân bản từ ${item.code}: ${item.description}`;
    this.showCloneModal = true;
  }

  closeCloneModal(): void {
    this.showCloneModal = false;
    this.targetCloneItem = null;
  }

  confirmClone(): void {
    if (!this.targetCloneItem || !this.cloneNewCode.trim()) return;
    const cloned = this.templateService.cloneTemplate(
      this.targetCloneItem.code,
      this.cloneNewCode.trim(),
      this.cloneNewName.trim(),
      this.cloneDesc.trim()
    );
    this.closeCloneModal();
    if (cloned) {
      if (confirm(`Đã nhân bản thành công quy trình [${cloned.code}]. Bạn có muốn mở ngay trên Canvas Builder để chỉnh sửa không?`)) {
        this.editOnCanvas(cloned);
      }
    }
  }

  // ============================================================================
  // 5. XÓA QUY TRÌNH VÀ KIỂM TRA CHẶN XÓA (FR-09)
  // ============================================================================
  handleDeleteClick(item: ProcessTemplateItem): void {
    this.targetDeleteItem = item;
    // Kiểm tra ràng buộc nghiệp vụ BR-TMP-09: Nếu còn flow instance đang chạy dở thì chặn xóa
    this.isDeleteBlocked = (item.active_instances_count !== undefined && item.active_instances_count > 0);
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.targetDeleteItem = null;
    this.isDeleteBlocked = false;
  }

  executeDelete(): void {
    if (!this.targetDeleteItem || this.isDeleteBlocked) return;
    this.templateService.deleteTemplate(this.targetDeleteItem.code);
    this.closeDeleteModal();
  }

  // ============================================================================
  // 6. XEM LỊCH SỬ PHIÊN BẢN (VERSION HISTORY)
  // ============================================================================
  openVersionHistoryModal(item: ProcessTemplateItem): void {
    this.targetVersionItem = item;
    this.showVersionModal = true;
  }

  closeVersionModal(): void {
    this.showVersionModal = false;
    this.targetVersionItem = null;
  }

  viewVersionOnCanvas(template: ProcessTemplateItem, version: TemplateVersionItem): void {
    this.closeVersionModal();
    this.router.navigate(['/process/graph'], {
      queryParams: {
        id: template.code,
        version: version.version_no
      }
    });
  }

  // ============================================================================
  // 7. A/B TESTING (FR-25, template_experiment)
  // ============================================================================
  openExperimentModal(): void {
    this.showExperimentModal = true;
    if (this.allTemplates.length > 0) {
      this.newExpTemplateCode = this.allTemplates[0].code;
      this.onExpTemplateSelect();
    }
  }

  closeExperimentModal(): void {
    this.showExperimentModal = false;
  }

  onExpTemplateSelect(): void {
    const t = this.templateService.getTemplateByCode(this.newExpTemplateCode);
    if (t) {
      this.newExpVersionA = `${t.version} (Hiện tại)`;
      this.newExpVersionB = 'V2.2 (Thử nghiệm)';
    }
  }

  confirmCreateExperiment(): void {
    const t = this.templateService.getTemplateByCode(this.newExpTemplateCode);
    const newExp: TemplateExperimentConfig = {
      experiment_id: `EXP-00${this.experiments.length + 1}`,
      template_code: this.newExpTemplateCode,
      template_name: t?.name || 'Quy trình thử nghiệm',
      version_a_id: 'ver-a',
      version_a_no: this.newExpVersionA,
      version_b_id: 'ver-b',
      version_b_no: this.newExpVersionB,
      ratio_a: this.newExpRatioA,
      status: 'running',
      target_metric: this.newExpMetric,
      started_at: 'Hôm nay',
      description: `Thử nghiệm phân bổ ${this.newExpRatioA}% luồng cho Bản A và ${100 - this.newExpRatioA}% luồng cho Bản B.`
    };

    this.templateService.saveExperiment(newExp);
    alert(`Đã kích hoạt thành công thử nghiệm A/B [${newExp.experiment_id}].`);
  }

  toggleExperiment(id: string): void {
    this.templateService.toggleExperimentStatus(id);
  }
}
