import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { GraphBridgeService } from '../services/graph-bridge.service';
import { NodePropertyModel, ActionLibraryItem, ConditionBranch, ConditionRuleItem } from '../models/node-property.model';
import { isGatewayType } from '../models/node-type';

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

  // Condition Modal (Image 4)
  public isConditionModalVisible: boolean = false;
  public editingBranch: ConditionBranch | null = null;
  public editingRules: ConditionRuleItem[] = [];
  public editingLogicOperator: 'AND' | 'OR' = 'AND';

  private sub = new Subscription();

  constructor(
    public bridgeService: GraphBridgeService,
    private translate: TranslateService,
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }

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
        if (this.nodeProps && this.ensureMappingRows(this.nodeProps)) {
          this.onPropChange('all');
        }
        if (this.nodeProps && isGatewayType(this.nodeProps.type)) {
          if (!this.nodeProps.branches || this.nodeProps.branches.length === 0) {
            this.nodeProps.branches = [
              { id: 'br-1', name: this.t('CANVAS.DEFAULT_CASE_NAME'), value: 'valid', expression: '.priority == "Cao"', rules: [{ param: '.priority', operator: 'EQ', value: 'Cao' }] },
              { id: 'br-default', name: this.t('CANVAS.DEFAULT_BRANCH'), value: 'default', expression: 'default', isDefault: true, rules: [] }
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

  public isGateway(type: string | undefined): boolean {
    return isGatewayType(type);
  }

  public getDrawerTitle(): string {
    if (!this.nodeProps) return this.t('DRAWER.DEFAULT_TITLE');
    if (isGatewayType(this.nodeProps.type)) {
      return this.t('DRAWER.GATEWAY_TITLE', { type: this.t(`NODE_TYPES.${this.nodeProps.type}`) });
    }
    return this.t(`NODE_TYPES.${this.nodeProps.type}`);
  }

  /** Bảng mapping mặc định khi node chưa có dữ liệu. Trả true nếu vừa thêm mặc định (cần lưu vào node). */
  private ensureMappingRows(props: NodePropertyModel): boolean {
    const defaults = () => [
      { source: this.t('DRAWER.DEFAULT_MAPPING_1'), target: '' },
      { source: this.t('DRAWER.DEFAULT_MAPPING_2'), target: '' }
    ];
    let changed = false;
    if (props.type === 'SYSTEM_TASK' && !props.actionInputMappings?.length) {
      props.actionInputMappings = defaults();
      changed = true;
    }
    if (props.type === 'SUB_PROCESS') {
      if (!props.subProcessInputMappings?.length) {
        props.subProcessInputMappings = defaults();
        changed = true;
      }
      if (!props.subProcessOutputMappings?.length) {
        props.subProcessOutputMappings = defaults();
        changed = true;
      }
    }
    return changed;
  }

  // Mapping helpers (lưu vào nodeProps để gửi lên khi Lưu nháp)
  public addInputMapping(): void {
    this.nodeProps?.subProcessInputMappings?.push({ source: this.t('DRAWER.NEW_PARAM'), target: '' });
    this.onPropChange('subProcessInputMappings');
  }

  public addOutputMapping(): void {
    this.nodeProps?.subProcessOutputMappings?.push({ source: this.t('DRAWER.NEW_PARAM'), target: '' });
    this.onPropChange('subProcessOutputMappings');
  }

  public removeInputMapping(index: number): void {
    this.nodeProps?.subProcessInputMappings?.splice(index, 1);
    this.onPropChange('subProcessInputMappings');
  }

  public removeOutputMapping(index: number): void {
    this.nodeProps?.subProcessOutputMappings?.splice(index, 1);
    this.onPropChange('subProcessOutputMappings');
  }

  public addActionMapping(): void {
    this.nodeProps?.actionInputMappings?.push({ source: this.t('DRAWER.NEW_PARAM'), target: '' });
    this.onPropChange('actionInputMappings');
  }

  public removeActionMapping(index: number): void {
    this.nodeProps?.actionInputMappings?.splice(index, 1);
    this.onPropChange('actionInputMappings');
  }

  public testConnection(): void {
    alert(this.t('MESSAGES.TEST_CONNECTION_OK'));
  }

  // Condition cases helpers
  public addCase(): void {
    if (!this.nodeProps) return;
    if (!this.nodeProps.branches) this.nodeProps.branches = [];
    const count = this.nodeProps.branches.filter(b => !b.isDefault).length + 1;
    const newBranch: ConditionBranch = {
      id: `br-${Date.now()}`,
      name: this.t('DRAWER.NEW_CASE', { index: count }),
      value: `case_${count}`,
      expression: '',
      isDefault: false,
      rules: [{ param: '.priority', operator: 'EQ', value: 'Cao' }],
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
      : [{ param: '.priority', operator: 'EQ', value: 'Cao' }];
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
    this.editingRules.push({ param: '.priority', operator: 'EQ', value: '' });
  }

  public removeRule(index: number): void {
    this.editingRules.splice(index, 1);
  }

  public deleteNode(): void {
    if (!this.nodeProps) return;
    if (confirm(this.t('MESSAGES.DELETE_NODE_CONFIRM', { name: this.nodeProps.label || this.nodeProps.typeTitle }))) {
      this.bridgeService.requestDeleteNode(this.nodeProps.id);
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
