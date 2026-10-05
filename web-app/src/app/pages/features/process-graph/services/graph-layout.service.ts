import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isGatewayType, normalizeNodeType } from '../models/node-type';
import { GraphEditorStore } from '../state/graph-editor.store';
import { GraphHistoryService } from './graph-history.service';

/** Tự động căn chỉnh sơ đồ (Auto Layout). */
@Injectable()
export class GraphLayoutService {
  constructor(
    private translate: TranslateService,
    private store: GraphEditorStore,
    private history: GraphHistoryService
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }


  public autoLayout(): void {
    if (!this.store.graph) return;
    const nodes = this.store.graph.getNodes();
    const edges = this.store.graph.getEdges();
    if (nodes.length === 0) return;

    // 1. Reset mọi điểm bẻ cong (vertices) thủ công của edges để đường nối tính toán chuẩn nhất
    edges.forEach((edge: any) => {
      edge.setVertices([]);
    });

    const inDegree: Record<string, number> = {};
    const outDegree: Record<string, number> = {};
    const levels: Record<string, number> = {};

    nodes.forEach((n: any) => {
      inDegree[n.id] = 0;
      outDegree[n.id] = 0;
      levels[n.id] = 0;
    });

    edges.forEach((e: any) => {
      const sourceId =
        typeof e.source === 'object' ? (e.source as any).cell : e.source;
      const targetId =
        typeof e.target === 'object' ? (e.target as any).cell : e.target;
      if (targetId && inDegree[targetId] !== undefined) {
        inDegree[targetId]++;
      }
      if (sourceId && outDegree[sourceId] !== undefined) {
        outDegree[sourceId]++;
      }
    });

    // Tách riêng các node chưa kết nối (isolated) để không làm lệch luồng chính
    const isolatedNodes = nodes.filter((n: any) => {
      const isConnected = inDegree[n.id] > 0 || outDegree[n.id] > 0;
      const isStartNode = normalizeNodeType(n.getData()?.type) === 'START';
      return !isConnected && !isStartNode;
    });

    const flowNodes = nodes.filter((n: any) => !isolatedNodes.includes(n));

    // Tính toán level (cột) theo thuật toán BFS Topo
    const queue = flowNodes
      .filter((n: any) => inDegree[n.id] === 0)
      .map((n: any) => n.id);
    if (queue.length === 0 && flowNodes.length > 0) {
      queue.push(flowNodes[0].id);
    }

    const visited = new Set<string>();
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      visited.add(currentId);
      const currentLevel = levels[currentId];

      edges.forEach((e: any) => {
        const sourceId =
          typeof e.source === 'object' ? (e.source as any).cell : e.source;
        const targetId =
          typeof e.target === 'object' ? (e.target as any).cell : e.target;
        if (sourceId === currentId && targetId) {
          levels[targetId] = Math.max(levels[targetId] || 0, currentLevel + 1);
          if (!visited.has(targetId) && !queue.includes(targetId)) {
            queue.push(targetId);
          }
        }
      });
    }

    const levelGroups: Record<number, any[]> = {};
    flowNodes.forEach((n: any) => {
      const lvl = levels[n.id] || 0;
      if (!levelGroups[lvl]) levelGroups[lvl] = [];
      levelGroups[lvl].push(n);
    });

    // 2. Tính toán toạ độ X cho từng cột với khoảng cách chuẩn (khoảng cách giữa các node tối thiểu 90-100px)
    const sortedLevels = Object.keys(levelGroups)
      .map(Number)
      .sort((a, b) => a - b);
    const colXMap: Record<number, number> = {};
    let currentX = 80;

    sortedLevels.forEach((lvl) => {
      colXMap[lvl] = currentX;
      const colNodes = levelGroups[lvl];
      let maxColWidth = 180;
      colNodes.forEach((n: any) => {
        const size = n.getSize();
        if (size?.width) {
          maxColWidth = Math.max(maxColWidth, size.width);
        }
      });
      // Khoảng trống giữa các bước trên luồng: 100px (đảm bảo mũi tên thẳng tắp, không bị gấp khúc hay vòng đè)
      currentX += maxColWidth + 100;
    });

    // 3. Căn chỉnh Y chuẩn theo tim cổng (port center alignment)
    // Giúp các đường nối giữa Trigger -> Task -> Notification -> End luôn nằm trên cùng 1 trục hoành (thẳng tắp 180 độ)
    const baseCenterY = 200;
    const branchRowGap = 120; // Khoảng cách giãn giữa các nhánh rẽ điều kiện / song song

    sortedLevels.forEach((lvl) => {
      const group = levelGroups[lvl];
      const count = group.length;

      group.forEach((node: any, idx: number) => {
        const nodeType = normalizeNodeType(node.getData()?.type, node.getData()?.gatewayType);
        const size = node.getSize();
        const height =
          size?.height ||
          (nodeType === 'START' || nodeType === 'END' ? 42 : 48);

        // Tim Y của hàng này (đối xứng quanh baseCenterY nếu có nhiều nhánh)
        let targetCenterY = baseCenterY;
        if (count > 1) {
          targetCenterY = baseCenterY + (idx - (count - 1) / 2) * branchRowGap;
        }

        // Port offset theo từng loại node:
        // - START (h=42, port 'out' ở cx=42, cy=21) -> portOffset = 21
        // - END (h=42, port 'in' ở cx=0, cy=21) -> portOffset = 21
        // - USER_TASK, NOTIFICATION, SUB_PROCESS, SYSTEM_TASK, JOIN (h=48, port ở y=24) -> portOffset = 24
        // - GATEWAY_* (port 'inHeader' ở y=22) -> portOffset = 22
        let portOffsetY = 24;
        if (nodeType === 'START' || nodeType === 'END') {
          portOffsetY = 21;
        } else if (isGatewayType(nodeType)) {
          portOffsetY = 22;
        }

        const x = colXMap[lvl];
        const y = Math.round(targetCenterY - portOffsetY);

        node.setPosition(x, y);
      });
    });

    // 4. Nếu có các node chưa nối dây (như node nháp kéo thả), xếp gọn gàng bên dưới sơ đồ chính
    if (isolatedNodes.length > 0) {
      let maxFlowY = 200;
      flowNodes.forEach((n: any) => {
        const pos = n.getPosition();
        const size = n.getSize();
        maxFlowY = Math.max(maxFlowY, pos.y + (size?.height || 48));
      });

      const stagingY = maxFlowY + 80;
      let stagingX = 80;
      isolatedNodes.forEach((node: any) => {
        const size = node.getSize();
        const width = size?.width || 180;
        node.setPosition(stagingX, stagingY);
        stagingX += width + 40;
      });
    }

    this.store.graph.centerContent();
    this.history.pushHistorySnapshot();
    this.store.selectedCellInfo = this.t('STATUS.AUTO_LAYOUT');
  }
}
