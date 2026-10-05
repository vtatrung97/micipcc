import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GraphBridgeService } from '../services/graph-bridge.service';
import { NodePropertyModel, ActionLibraryItem, ConditionBranch, ConditionRuleItem } from '../graph-editor.component';

@Component({
  selector: 'app-node-config-drawer',
  templateUrl: './node-config-drawer.component.html',
  styleUrls: ['./node-config-drawer.component.scss']
})
export class NodeConfigDrawerComponent implements OnInit, OnDestroy {
  public isVisible: boolean = false;
  public selectedNode: any = null;
  public nodeProps: NodePropertyModel | null = null;

  // Accordion open/close states
  public accordions: Record<string, boolean> = {
    general: true,
    actor: true,
    sla: true,
    output: true,
    notification: true,
    subProcess: true,
    mappingInput: true,
    mappingOutput: true,
    integration: true,
    execution: true,
    outputApi: true,
    cases: true,
    defaultFlow: true,
    errorFlow: true
  };

  // SubProcess Mappings
  public subProcessInputRows: Array<{ source: string; target: string }> = [
    { source: 'Phân loại phản ánh cấp 1', target: 'Phân loại phản ánh cấp 1' },
    { source: 'Phân loại phản ánh cấp 2', target: 'Phân loại phản ánh cấp 2' }
  ];

  public subProcessOutputRows: Array<{ source: string; target: string }> = [
    { source: 'Phân loại phản ánh cấp 1', target: 'Phân loại phản ánh cấp 1' },
    { source: 'Phân loại phản ánh cấp 2', target: 'Phân loại phản ánh cấp 2' }
  ];

  // Action Input Mappings
  public actionInputRows: Array<{ source: string; target: string }> = [
    { source: 'Phân loại phản ánh cấp 1', target: 'Chọn tại đây' },
    { source: 'Phân loại phản ánh cấp 2', target: 'Chọn tại đây' }
  ];

  // Condition Modal (Image 4)
  public isConditionModalVisible: boolean = false;
  public editingBranch: ConditionBranch | null = null;
  public editingRules: ConditionRuleItem[] = [];
  public editingLogicOperator: 'AND' | 'OR' = 'AND';

  private sub = new Subscription();

  constructor(public bridgeService: GraphBridgeService) {}

  ngOnInit(): void {
    this.sub.add(
      this.bridgeService.isDrawerOpen$.subscribe(open => {
        this.isVisible = open;
      })
    );

    this.sub.add(
      this.bridgeService.selectedNode$.subscribe(node => {
        this.selectedNode = node;
      })
    );

    this.sub.add(
      this.bridgeService.selectedNodeProps$.subscribe(props => {
        this.nodeProps = props ? { ...props } : null;
        if (this.nodeProps && (this.nodeProps.type === 'condition' || this.nodeProps.type === 'split')) {
          if (!this.nodeProps.branches || this.nodeProps.branches.length === 0) {
            this.nodeProps.branches = [
              { id: 'br-1', name: 'Đủ thông tin', value: 'valid', expression: '.priority == "Cao"', rules: [{ param: '.priority', operator: 'Bằng (=)', value: 'Cao' }] },
              { id: 'br-default', name: 'Mặc định', value: 'default', expression: 'default', isDefault: true, rules: [] }
            ];
          }
        }
      })
    );
  }

  public onClose(): void {
    this.bridgeService.closeDrawer();
  }

  public onLabelChange(): void {
    if (!this.nodeProps) return;
    this.bridgeService.updateNodeLabel(this.nodeProps.id, this.nodeProps.label, this.nodeProps);
  }

  public onPropChange(field?: keyof NodePropertyModel | 'all'): void {
    if (!this.nodeProps) return;
    const value = field && field !== 'all' ? this.nodeProps[field] : this.nodeProps;
    this.bridgeService.updateNodeProp(this.nodeProps.id, field || 'all', value, this.nodeProps);
  }

  public toggleAccordion(key: string): void {
    this.accordions[key] = !this.accordions[key];
  }

  public getDrawerTitle(): string {
    if (!this.nodeProps) return 'Thuộc tính bước';
    if (this.nodeProps.type === 'condition' || this.nodeProps.type === 'split' || this.nodeProps.type === 'merge') {
      if (this.nodeProps.gatewayType === 'parallel' || this.nodeProps.type === 'split') {
        return 'Điều kiện (Chạy song song)';
      } else if (this.nodeProps.gatewayType === 'inclusive') {
        return 'Điều kiện (Chọn nhiều nhánh)';
      } else {
        return 'Điều kiện (Chọn 1 nhánh)';
      }
    }
    switch (this.nodeProps.type) {
      case 'trigger': return 'Bắt đầu';
      case 'end': return 'Kết thúc';
      case 'task': return 'Giao việc';
      case 'notification': return 'Thông báo';
      case 'sub_process': return 'Quy trình con';
      case 'action': return 'Tác vụ hệ thống';
      default: return this.nodeProps.typeTitle || 'Thuộc tính bước';
    }
  }

  // SubProcess helpers
  public addInputMapping(): void {
    this.subProcessInputRows.push({ source: 'Tham số mới', target: 'Chọn tại đây' });
  }

  public addOutputMapping(): void {
    this.subProcessOutputRows.push({ source: 'Tham số mới', target: 'Chọn tại đây' });
  }

  public removeInputMapping(index: number): void {
    this.subProcessInputRows.splice(index, 1);
  }

  public removeOutputMapping(index: number): void {
    this.subProcessOutputRows.splice(index, 1);
  }

  // Action helpers
  public addActionMapping(): void {
    this.actionInputRows.push({ source: 'Tham số mới', target: 'Chọn tại đây' });
  }

  public removeActionMapping(index: number): void {
    this.actionInputRows.splice(index, 1);
  }

  public testConnection(): void {
    alert('Kiểm tra kết nối: Đã kết nối thành công tới hệ thống API tích hợp!');
  }

  // Condition cases helpers
  public addCase(): void {
    if (!this.nodeProps) return;
    if (!this.nodeProps.branches) this.nodeProps.branches = [];
    const count = this.nodeProps.branches.filter(b => !b.isDefault).length + 1;
    const newBranch: ConditionBranch = {
      id: `br-${Date.now()}`,
      name: `Trường hợp ${count}`,
      value: `case_${count}`,
      expression: '',
      isDefault: false,
      rules: [{ param: '.priority', operator: 'Bằng (=)', value: 'Cao' }],
      logicOperator: 'AND'
    };

    const defaultIdx = this.nodeProps.branches.findIndex(b => b.isDefault);
    if (defaultIdx !== -1) {
      this.nodeProps.branches.splice(defaultIdx, 0, newBranch);
    } else {
      this.nodeProps.branches.push(newBranch);
    }
    this.onPropChange('branches');
  }

  public removeCase(index: number): void {
    if (!this.nodeProps?.branches) return;
    this.nodeProps.branches.splice(index, 1);
    this.onPropChange('branches');
  }

  public openConditionModal(branch: ConditionBranch): void {
    this.editingBranch = branch;
    this.editingRules = branch.rules && branch.rules.length > 0
      ? JSON.parse(JSON.stringify(branch.rules))
      : [{ param: '.priority', operator: 'Bằng (=)', value: 'Cao' }];
    this.editingLogicOperator = branch.logicOperator || 'AND';
    this.isConditionModalVisible = true;
  }

  public closeConditionModal(): void {
    this.isConditionModalVisible = false;
    this.editingBranch = null;
  }

  public saveConditionModal(): void {
    if (this.editingBranch) {
      this.editingBranch.rules = [...this.editingRules];
      this.editingBranch.logicOperator = this.editingLogicOperator;
      this.onPropChange('branches');
    }
    this.isConditionModalVisible = false;
    this.editingBranch = null;
  }

  public addRule(): void {
    this.editingRules.push({ param: '.priority', operator: 'Bằng (=)', value: '' });
  }

  public removeRule(index: number): void {
    this.editingRules.splice(index, 1);
  }

  public deleteNode(): void {
    if (!this.nodeProps) return;
    if (confirm(`Bạn có chắc chắn muốn xoá bước [${this.nodeProps.label || this.nodeProps.typeTitle}]?`)) {
      this.bridgeService.requestDeleteNode(this.nodeProps.id);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
