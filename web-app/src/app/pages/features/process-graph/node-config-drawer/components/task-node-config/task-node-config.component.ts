import { Component, Input } from '@angular/core';
import { NodePropertyModel } from '../../../graph-editor.component';
import { GraphBridgeService } from '../../../services/graph-bridge.service';

@Component({
  selector: 'app-task-node-config',
  templateUrl: './task-node-config.component.html',
  styleUrls: ['./task-node-config.component.scss']
})
export class TaskNodeConfigComponent {
  @Input() nodeProps!: NodePropertyModel;

  constructor(private bridgeService: GraphBridgeService) {}

  public onPropChange(field?: keyof NodePropertyModel | 'all'): void {
    if (!this.nodeProps) return;
    const value = field && field !== 'all' ? this.nodeProps[field] : this.nodeProps;
    this.bridgeService.updateNodeProp(this.nodeProps.id, field || 'all', value, this.nodeProps);
  }

  public onUserTaskApprovalToggle(): void {
    if (!this.nodeProps) return;
    this.bridgeService.toggleApproval(this.nodeProps.id, !!this.nodeProps.isApprovalStep);
  }
}
