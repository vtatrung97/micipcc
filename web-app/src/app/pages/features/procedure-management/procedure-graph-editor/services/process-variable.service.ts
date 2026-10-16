import { Injectable } from '@angular/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import { NodePropertyModel } from '../models/node-property.model';
import { declaredVariables } from '../models/process-variable';
import { GraphEditorStore } from '../state/graph-editor.store';

export interface ProcessVariableOption extends SelectOption<string> {
  /** Tên hiển thị của biến (dòng phụ dưới tên biến) */
  displayName: string;
}

/**
 * Biến quy trình trên canvas. Provide ở GraphEditorComponent (cùng phạm vi với GraphEditorStore).
 * Nguồn biến: Khởi tạo biến của Bắt đầu + Dữ liệu đầu ra của Giao việc / Tác vụ hệ thống / Quy trình con.
 */
@Injectable()
export class ProcessVariableService {
  constructor(private store: GraphEditorStore) {}

  /**
   * Biến dùng được tại một bước = biến khai báo ở mọi bước đứng trước nó theo luồng (đi ngược các cạnh nối).
   * Không truyền nodeId → biến của cả quy trình. Biến ở bước xa hơn đứng trước, trùng tên chỉ lấy 1.
   */
  getVariables(nodeId?: string | null): ProcessVariableOption[] {
    const graph = this.store.graph;
    if (!graph) return [];
    const nodes: any[] = nodeId ? this.upstreamNodes(nodeId) : graph.getNodes();
    const result = new Map<string, ProcessVariableOption>();
    nodes.forEach((n) => {
      declaredVariables(n.getData() || {}).forEach((v) => {
        if (!result.has(v.name)) result.set(v.name, { value: v.name, label: v.name, displayName: v.displayName });
      });
    });
    return [...result.values()];
  }

  /** Tên biến đã khai báo ở các bước khác (để chặn trùng khi khai báo biến mới tại bước này) */
  otherDeclaredNames(nodeId: string): string[] {
    return (this.store.graph?.getNodes() || [])
      .filter((n: any) => n.id !== nodeId)
      .flatMap((n: any) => declaredVariables((n.getData() || {}) as NodePropertyModel).map((v) => v.name));
  }

  /** Các bước đứng trước nodeId (BFS ngược theo cạnh), xếp từ xa đến gần */
  private upstreamNodes(nodeId: string): any[] {
    const graph = this.store.graph;
    const start = graph.getCellById(nodeId);
    if (!start) return [];
    const dist = new Map<string, number>([[nodeId, 0]]);
    const queue: any[] = [start];
    while (queue.length) {
      const cell = queue.shift();
      const d = dist.get(cell.id) || 0;
      (graph.getIncomingEdges(cell) || []).forEach((edge: any) => {
        const source = edge.getSourceCell();
        if (source && !dist.has(source.id)) {
          dist.set(source.id, d + 1);
          queue.push(source);
        }
      });
    }
    dist.delete(nodeId);
    return [...dist.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => graph.getCellById(id))
      .filter(Boolean);
  }
}
