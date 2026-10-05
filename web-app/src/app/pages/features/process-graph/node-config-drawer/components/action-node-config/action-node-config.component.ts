import { Component, Input } from '@angular/core';
import { NodePropertyModel, ActionLibraryItem } from '../../../models/node-property.model';
import { GraphBridgeService } from '../../../services/graph-bridge.service';
import { DEFAULT_ACTION_LIBRARIES } from './action-node-config.constants';

@Component({
  selector: 'app-action-node-config',
  templateUrl: './action-node-config.component.html',
  styleUrls: ['./action-node-config.component.scss']
})
export class ActionNodeConfigComponent {
  @Input() nodeProps!: NodePropertyModel;
  public actionLibraries: ActionLibraryItem[] = DEFAULT_ACTION_LIBRARIES;

  constructor(private bridgeService: GraphBridgeService) {}

  public onPropChange(field?: keyof NodePropertyModel | 'all'): void {
    if (!this.nodeProps) return;
    const value = field && field !== 'all' ? this.nodeProps[field] : this.nodeProps;
    this.bridgeService.updateNodeProp(this.nodeProps.id, field || 'all', value, this.nodeProps);
  }

  public setActionSource(source: 'library' | 'custom'): void {
    if (!this.nodeProps) return;
    this.nodeProps.actionSource = source;
    if (source === 'library' && !this.nodeProps.actionLibraryId && this.actionLibraries.length > 0) {
      this.onActionLibrarySelect(this.actionLibraries[0].id);
    } else {
      this.onPropChange('actionSource');
    }
  }

  public onActionLibrarySelect(libraryId: any): void {
    if (!this.nodeProps) return;
    const item = this.actionLibraries.find(lib => lib.id === libraryId);
    if (!item) return;

    this.nodeProps.actionLibraryId = item.id;
    this.nodeProps.actionEndpoint = item.endpoint;
    this.nodeProps.actionMethod = item.method;
    this.nodeProps.label = item.name;
    if (item.defaultRequestBody) {
      this.nodeProps.requestBodyMapping = item.defaultRequestBody;
    }
    if (item.defaultResponseMapping) {
      this.nodeProps.responseMapping = item.defaultResponseMapping;
    }

    this.bridgeService.updateNodeLabel(this.nodeProps.id, this.nodeProps.label, this.nodeProps);
    this.onPropChange('all');
  }
}
