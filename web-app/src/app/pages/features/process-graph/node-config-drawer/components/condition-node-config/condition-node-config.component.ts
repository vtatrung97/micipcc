import { Component, Input } from '@angular/core';
import { NodePropertyModel } from '../../../graph-editor.component';
import { GraphBridgeService } from '../../../services/graph-bridge.service';

@Component({
  selector: 'app-condition-node-config',
  templateUrl: './condition-node-config.component.html',
  styleUrls: ['./condition-node-config.component.scss']
})
export class ConditionNodeConfigComponent {
  @Input() nodeProps!: NodePropertyModel;

  constructor(private bridgeService: GraphBridgeService) {}

  public onPropChange(field?: keyof NodePropertyModel | 'all'): void {
    if (!this.nodeProps) return;
    const value = field && field !== 'all' ? this.nodeProps[field] : this.nodeProps;
    this.bridgeService.updateNodeProp(this.nodeProps.id, field || 'all', value, this.nodeProps);
  }

  public addBranch(): void {
    if (!this.nodeProps) return;
    this.bridgeService.triggerBranchAction(this.nodeProps.id, 'add', undefined, this.nodeProps);
  }

  public removeBranch(index: number): void {
    if (!this.nodeProps) return;
    this.bridgeService.triggerBranchAction(this.nodeProps.id, 'remove', index, this.nodeProps);
  }

  public onBranchChange(index?: number): void {
    if (!this.nodeProps) return;
    this.bridgeService.triggerBranchAction(this.nodeProps.id, 'change', index, this.nodeProps);
  }
}
