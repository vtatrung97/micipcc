import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { NodePropertyModel, ActionLibraryItem } from '../graph-editor.component';

export interface NodeUpdateEvent {
  nodeId: string;
  field?: keyof NodePropertyModel | 'all' | 'label';
  value?: any;
  props: NodePropertyModel;
}

export interface BranchUpdateEvent {
  nodeId: string;
  action: 'add' | 'remove' | 'change';
  index?: number;
  props: NodePropertyModel;
}

@Injectable({
  providedIn: 'root'
})
export class GraphBridgeService {
  // 1. Reactive state for selected node & drawer
  public selectedNode$ = new BehaviorSubject<any | null>(null);
  public selectedNodeProps$ = new BehaviorSubject<NodePropertyModel | null>(null);
  public isDrawerOpen$ = new BehaviorSubject<boolean>(false);

  // 2. Action Library items catalog
  public actionLibraries$ = new BehaviorSubject<ActionLibraryItem[]>([]);

  // 3. Event-driven streams for Canvas <-> Drawer updates
  public nodeUpdated$ = new Subject<NodeUpdateEvent>();
  public branchUpdated$ = new Subject<BranchUpdateEvent>();
  public approvalToggled$ = new Subject<{ nodeId: string; isApproval: boolean }>();
  public nodeDeleted$ = new Subject<string>();

  // 4. Modal Dialog Requests
  public modalRequest$ = new Subject<{
    type: 'info' | 'notify' | 'json' | 'validation';
    payload?: any;
  }>();

  // --- Public APIs for Canvas (AntV X6) ---
  public selectNode(node: any, props: NodePropertyModel): void {
    this.selectedNode$.next(node);
    this.selectedNodeProps$.next({ ...props });
    this.isDrawerOpen$.next(true);
  }

  public clearSelection(): void {
    this.selectedNode$.next(null);
    this.selectedNodeProps$.next(null);
    this.isDrawerOpen$.next(false);
  }

  public openDrawer(): void {
    this.isDrawerOpen$.next(true);
  }

  public closeDrawer(): void {
    this.isDrawerOpen$.next(false);
  }

  // --- Public APIs for Right Drawer Component ---
  public updateNodeProp(nodeId: string, field: keyof NodePropertyModel | 'all', value: any, props: NodePropertyModel): void {
    this.selectedNodeProps$.next({ ...props });
    this.nodeUpdated$.next({ nodeId, field, value, props });
  }

  public updateNodeLabel(nodeId: string, label: string, props: NodePropertyModel): void {
    this.selectedNodeProps$.next({ ...props, label });
    this.nodeUpdated$.next({ nodeId, field: 'label', value: label, props });
  }

  public toggleApproval(nodeId: string, isApproval: boolean): void {
    this.approvalToggled$.next({ nodeId, isApproval });
  }

  public triggerBranchAction(nodeId: string, action: 'add' | 'remove' | 'change', index: number | undefined, props: NodePropertyModel): void {
    this.selectedNodeProps$.next({ ...props });
    this.branchUpdated$.next({ nodeId, action, index, props });
  }

  public requestDeleteNode(nodeId: string): void {
    this.nodeDeleted$.next(nodeId);
    this.clearSelection();
  }

  public requestModal(type: 'info' | 'notify' | 'json' | 'validation', payload?: any): void {
    this.modalRequest$.next({ type, payload });
  }
}
