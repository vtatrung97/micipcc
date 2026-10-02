import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { GraphBridgeService } from '../services/graph-bridge.service';
import { NodePropertyModel, ActionLibraryItem, ConditionBranch } from '../graph-editor.component';

@Component({
  selector: 'app-node-config-drawer',
  templateUrl: './node-config-drawer.component.html',
  styleUrls: ['./node-config-drawer.component.scss']
})
export class NodeConfigDrawerComponent implements OnInit, OnDestroy {
  public isVisible: boolean = false;
  public selectedNode: any = null;
  public nodeProps: NodePropertyModel | null = null;

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
