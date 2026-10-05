import { Component, Input } from '@angular/core';
import { NodePropertyModel } from '../../../models/node-property.model';
import { GraphBridgeService } from '../../../services/graph-bridge.service';

@Component({
  selector: 'app-trigger-node-config',
  templateUrl: './trigger-node-config.component.html',
  styleUrls: ['./trigger-node-config.component.scss']
})
export class TriggerNodeConfigComponent {
  @Input() nodeProps!: NodePropertyModel;

  constructor(private bridgeService: GraphBridgeService) {}

  public onPropChange(field?: keyof NodePropertyModel | 'all'): void {
    if (!this.nodeProps) return;
    const value = field && field !== 'all' ? this.nodeProps[field] : this.nodeProps;
    this.bridgeService.updateNodeProp(this.nodeProps.id, field || 'all', value, this.nodeProps);
  }
}
