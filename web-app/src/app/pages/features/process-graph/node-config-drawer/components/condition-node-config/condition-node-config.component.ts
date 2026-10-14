import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ConditionBranch, NodePropertyModel } from '../../../models/node-property.model';
import { NodeFieldErrors } from '../../../models/node-validation';
import { NODE_TEXT_LIMITS, applyLabelChange, nodeKeyFilter } from '../../../models/node-key';
import { isFixedBranch } from '../../../models/gateway-branch';
import { BranchModalMode, BranchModalResult } from '../../../modals/branch-condition-modal.component';
import { GraphBridgeService } from '../../../services/graph-bridge.service';

type SectionKey = 'general' | 'branches';

/** Nội dung drawer node Điều kiện (3 loại): thông tin chung + danh sách nhánh, thêm / sửa nhánh qua modal */
@Component({
  selector: 'app-condition-node-config',
  templateUrl: './condition-node-config.component.html',
  styleUrls: ['./condition-node-config.component.scss'],
})
export class ConditionNodeConfigComponent {
  @Input() nodeProps!: NodePropertyModel;
  /** Lỗi trường bắt buộc do drawer kiểm tra khi bấm Lưu */
  @Input() errors: NodeFieldErrors = {};

  readonly limits = NODE_TEXT_LIMITS;
  readonly nodeKeyFilter = nodeKeyFilter;

  openSections: Record<SectionKey, boolean> = { general: true, branches: true };

  /** Modal nhánh: null = đang đóng */
  modalMode: BranchModalMode | null = null;
  editingBranch: ConditionBranch | null = null;

  constructor(
    private bridgeService: GraphBridgeService,
    private translate: TranslateService,
  ) {}

  get branches(): ConditionBranch[] {
    return this.nodeProps.branches || [];
  }

  /** Tên các nhánh khác nhánh đang sửa — để modal báo trùng tên */
  get otherNames(): string[] {
    return this.branches.filter((b) => b !== this.editingBranch).map((b) => this.branchName(b));
  }

  get suggestedName(): string {
    const count = this.branches.filter((b) => !isFixedBranch(b)).length + 1;
    return this.translate.instant('PROCESS_GRAPH.CANVAS.BRANCH_N', { index: count });
  }

  isOpen(key: SectionKey): boolean {
    return this.openSections[key];
  }

  toggleSection(key: SectionKey): void {
    this.openSections[key] = !this.openSections[key];
  }

  branchName(branch: ConditionBranch): string {
    if (branch.isDefault) return this.translate.instant('PROCESS_GRAPH.CANVAS.DEFAULT_BRANCH');
    if (branch.isError) return this.translate.instant('PROCESS_GRAPH.CANVAS.ERROR_BRANCH');
    return branch.name || '';
  }

  openModal(mode: BranchModalMode, branch: ConditionBranch | null = null): void {
    this.modalMode = mode;
    this.editingBranch = branch;
  }

  closeModal(): void {
    this.modalMode = null;
    this.editingBranch = null;
  }

  /** Lưu từ modal: thêm nhánh mới trước nhánh Mặc định, hoặc cập nhật nhánh đang sửa */
  onModalSaved(result: BranchModalResult): void {
    const branches = this.branches.map((b) => ({ ...b }));
    if (this.modalMode === 'edit' && this.editingBranch) {
      const idx = this.branches.indexOf(this.editingBranch);
      if (idx >= 0) branches[idx] = { ...branches[idx], name: result.name, defaultLabel: result.name, rules: result.rules };
    } else {
      const newBranch: ConditionBranch = {
        id: `br-${Date.now()}`,
        name: result.name,
        defaultLabel: result.name,
        value: '',
        expression: '',
        isDefault: false,
        rules: result.rules,
        logicOperator: 'AND',
      };
      // Chèn trước 2 nhánh cố định (Mặc định, Lỗi)
      const fixedIdx = branches.findIndex((b) => isFixedBranch(b));
      branches.splice(fixedIdx === -1 ? branches.length : fixedIdx, 0, newBranch);
    }
    this.closeModal();
    this.syncBranches(branches);
  }

  /** Xoá nhánh (Mặc định, Lỗi không xoá được); Hủy ở drawer sẽ khôi phục lại */
  removeBranch(branch: ConditionBranch): void {
    if (isFixedBranch(branch)) return;
    this.syncBranches(this.branches.filter((b) => b !== branch));
  }

  /** Đổi tên bước; mã bước còn tự sinh thì sinh lại theo tên mới */
  onLabelChange(label: string): void {
    applyLabelChange(this.nodeProps, label);
    this.bridgeService.updateNodeLabel(this.nodeProps.id, this.nodeProps.label, this.nodeProps);
  }

  save(field: keyof NodePropertyModel): void {
    this.bridgeService.updateNodeProp(this.nodeProps.id, field, this.nodeProps[field], this.nodeProps);
  }

  isFixed(branch: ConditionBranch): boolean {
    return isFixedBranch(branch);
  }

  trackById(_: number, branch: ConditionBranch): string {
    return branch.id;
  }

  /** Ghi danh sách nhánh mới và đồng bộ card + cổng ra trên canvas */
  private syncBranches(branches: ConditionBranch[]): void {
    this.nodeProps.branches = branches;
    this.bridgeService.triggerBranchAction(this.nodeProps.id, 'sync', undefined, this.nodeProps);
  }
}
