import { Injectable } from '@angular/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import { NodePropertyModel } from '../models/node-property.model';
import { GraphEditorStore } from '../state/graph-editor.store';

export interface ProcessVariableOption extends SelectOption<string> {
  /** Tên hiển thị của biến (dòng phụ dưới tên biến) */
  displayName: string;
}

/**
 * Biến quy trình trên canvas: biến khởi tạo ở node Bắt đầu + dữ liệu đầu ra của các node Giao việc.
 * Provide ở GraphEditorComponent (cùng phạm vi với GraphEditorStore).
 */
@Injectable()
export class ProcessVariableService {
  constructor(private store: GraphEditorStore) {}

  getVariables(): ProcessVariableOption[] {
    const result = new Map<string, ProcessVariableOption>();
    const add = (name: string | null | undefined, displayName: string | undefined) => {
      const key = (name || '').trim();
      if (key && !result.has(key)) result.set(key, { value: key, label: key, displayName: displayName || '' });
    };
    const nodes: NodePropertyModel[] = (this.store.graph?.getNodes() || []).map((n: any) => n.getData() || {});
    nodes.filter((d) => d.type === 'START').forEach((d) => d.startVariables?.forEach((v) => add(v.variable, v.displayName)));
    nodes.filter((d) => d.type === 'USER_TASK').forEach((d) => d.formOutputs?.forEach((v) => add(v.variable, v.displayName)));
    return [...result.values()];
  }
}
