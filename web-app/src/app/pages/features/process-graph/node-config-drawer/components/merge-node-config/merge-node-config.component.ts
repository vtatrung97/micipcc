import { Component, Input } from '@angular/core';
import { NodePropertyModel } from '../../../graph-editor.component';
import { GraphBridgeService } from '../../../services/graph-bridge.service';

@Component({
  selector: 'app-merge-node-config',
  templateUrl: './merge-node-config.component.html',
  styleUrls: ['./merge-node-config.component.scss']
})
export class MergeNodeConfigComponent {
  @Input() nodeProps!: NodePropertyModel;

  constructor(private bridgeService: GraphBridgeService) {}

  public onPropChange(field?: keyof NodePropertyModel | 'all'): void {
    if (!this.nodeProps) return;
    const value = field && field !== 'all' ? this.nodeProps[field] : this.nodeProps;
    this.bridgeService.updateNodeProp(this.nodeProps.id, field || 'all', value, this.nodeProps);
  }
}
