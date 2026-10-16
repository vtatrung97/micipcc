import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { edgeAttrs } from '../config/edge-style.config';
import { NODE_CARD_HEIGHT, NODE_CARD_WIDTH, NODE_CIRCLE_SIZE, NODE_HEADER_CENTER_Y } from '../config/node-view.config';
import { NodeType, isGatewayType } from '../models/node-type';
import { GraphEditorStore } from '../state/graph-editor.store';
import { GatewayJoinService } from './gateway-join.service';
import { GraphBridgeService } from './graph-bridge.service';
import { GraphHistoryService } from './graph-history.service';
import { NodeEditorService } from './node-editor.service';
import { NodeFactoryService } from './node-factory.service';

/** Khoảng cách ngang giữa bước nguồn và bước mới */
const STEP_GAP_X = 120;
/** Drawer cấu hình (500px) che phần phải canvas khi mở */
const DRAWER_WIDTH = 500;

/** Cổng nguồn để nối cạnh sang bước mới */
export interface PlacementSource {
  nodeId: string;
  portId: string;
}

/**
 * Thêm một bước lên canvas — dùng chung cho kéo thả từ Thư viện bước, bấm trên Thư viện bước
 * và "+ Thêm bước": tạo node (kèm Gộp nhánh nếu là điều kiện), nối cạnh nếu có nguồn,
 * chọn node + mở drawer, ghi lịch sử hoàn tác.
 * Provide ở GraphEditorComponent.
 */
@Injectable()
export class NodePlacementService {
  constructor(
    private store: GraphEditorStore,
    private factory: NodeFactoryService,
    private gatewayJoin: GatewayJoinService,
    private editor: NodeEditorService,
    private bridgeService: GraphBridgeService,
    private history: GraphHistoryService,
    private translate: TranslateService,
  ) {}

  /** Kích thước node theo loại (Kết thúc là hình tròn) */
  static sizeOf(type: NodeType): { width: number; height: number } {
    return type === 'START' || type === 'END'
      ? { width: NODE_CIRCLE_SIZE, height: NODE_CIRCLE_SIZE }
      : { width: NODE_CARD_WIDTH, height: NODE_CARD_HEIGHT };
  }

  /** Đặt bước tại (x, y) = góc trên trái; trả về node mới */
  placeNode(type: NodeType, x: number, y: number, source?: PlacementSource): any {
    const graph = this.store.graph;
    if (!graph) return null;
    const node = this.factory.createCompactCardNode(type, x, y);
    if (!node) return null;
    // Bước mới: Hủy ở drawer trước khi Lưu lần đầu sẽ xoá bước
    node.setData({ ...node.getData(), isUnconfigured: true });
    if (isGatewayType(type)) this.gatewayJoin.createJoinForGateway(node);

    if (source && graph.getCellById(source.nodeId)) {
      const targetPort = node.getPorts().find((p: any) => String(p.group || '').startsWith('in'))?.id || 'in';
      graph.addEdge({
        source: { cell: source.nodeId, port: source.portId },
        target: { cell: node.id, port: targetPort },
        attrs: edgeAttrs(),
      });
    }

    this.editor.selectNode(node);
    this.store.isDrawerOpen = true;
    this.bridgeService.selectNode(node, this.store.selectedNodeProps);
    this.store.selectedCellInfo = this.translate.instant('PROCESS_GRAPH.STATUS.NODE_ADDED', {
      type: this.translate.instant(`PROCESS_GRAPH.NODE_TYPES.${type}`),
    });
    this.store.updateCounts();
    this.history.pushHistorySnapshot();
    this.revealNode(node);
    return node;
  }

  /** Đặt bước bên phải cổng nguồn (ngang hàng cổng, tránh đè node khác) và nối cạnh từ cổng đó */
  placeNodeAfter(type: NodeType, source: PlacementSource): any {
    const graph = this.store.graph;
    const sourceNode = graph?.getCellById(source.nodeId);
    if (!sourceNode) return null;
    const bbox = sourceNode.getBBox();
    const { width, height } = NodePlacementService.sizeOf(type);
    const anchorY = height === NODE_CARD_HEIGHT ? NODE_HEADER_CENTER_Y : height / 2;
    const x = bbox.x + bbox.width + STEP_GAP_X;
    const y = this.findFreeY(x, this.portLocalY(sourceNode, source.portId) - anchorY, width, height);
    return this.placeNode(type, x, y, source);
  }

  /**
   * Bấm trên Thư viện bước: thêm ngay sau bước đang chọn (hoặc bước ngoài cùng bên phải còn cổng ra trống)
   * và nối cạnh; không có bước nào để nối thì đặt giữa khung nhìn.
   */
  placeNodeFromPalette(type: NodeType): any {
    const source = this.findSource();
    return source ? this.placeNodeAfter(type, source) : this.placeNodeInView(type);
  }

  /** Cổng ra đầu tiên chưa nối của node; null nếu không còn (hoặc là Kết thúc) */
  freeOutPort(node: any): string | null {
    if (!node || node.getData()?.type === 'END') return null;
    const used = new Set((this.store.graph?.getOutgoingEdges(node) || []).map((e: any) => e.getSourcePortId()));
    return node.getPorts().find((p: any) => !String(p.group || '').startsWith('in') && !used.has(p.id))?.id || null;
  }

  /** Đặt bước giữa khung nhìn hiện tại */
  placeNodeInView(type: NodeType): any {
    const graph = this.store.graph;
    if (!graph) return null;
    const area = graph.getPlugin?.('scroller')?.getVisibleArea?.() || graph.getGraphArea?.();
    const { width, height } = NodePlacementService.sizeOf(type);
    const cx = area ? area.x + area.width / 2 : 400;
    const cy = area ? area.y + area.height / 2 : 300;
    const x = cx - width / 2;
    return this.placeNode(type, x, this.findFreeY(x, cy - height / 2, width, height));
  }

  private findSource(): PlacementSource | null {
    const selected = this.store.selectedNode;
    const selectedPort = this.freeOutPort(selected);
    if (selected && selectedPort) return { nodeId: selected.id, portId: selectedPort };
    const candidates = (this.store.graph?.getNodes() || [])
      .filter((n: any) => this.freeOutPort(n))
      .sort((a: any, b: any) => b.getBBox().x - a.getBBox().x);
    const node = candidates[0];
    return node ? { nodeId: node.id, portId: this.freeOutPort(node) as string } : null;
  }

  /** Toạ độ Y (local) của tâm cổng — đọc từ DOM nên đúng cả với cổng của dòng nhánh */
  private portLocalY(node: any, portId: string): number {
    const graph = this.store.graph;
    const el = graph.findViewByCell(node)?.findPortElem(portId, 'portCircle');
    if (!el) return node.getBBox().center.y;
    const r = el.getBoundingClientRect();
    return graph.clientToLocal({ x: r.left + r.width / 2, y: r.top + r.height / 2 }).y;
  }

  /** Bước mới nằm ngoài vùng nhìn thấy (hoặc dưới drawer) → cuộn canvas đưa bước vào giữa phần còn trống */
  private revealNode(node: any): void {
    const graph = this.store.graph;
    const scroller = graph?.getPlugin?.('scroller');
    const area = scroller?.getVisibleArea?.() || graph?.getGraphArea?.();
    if (!area) return;
    const covered = DRAWER_WIDTH / (graph.zoom() || 1);
    const usableWidth = Math.max(area.width - covered, area.width / 2);
    const b = node.getBBox();
    const isVisible =
      b.x >= area.x && b.y >= area.y && b.x + b.width <= area.x + usableWidth && b.y + b.height <= area.y + area.height;
    if (isVisible) return;
    // Tâm bước nằm giữa phần canvas không bị drawer che
    const offsetX = (area.width - usableWidth) / 2;
    (scroller?.centerPoint ? scroller : graph).centerPoint(b.x + b.width / 2 + offsetX, b.y + b.height / 2);
  }

  /** Dời xuống tới khi không đè lên node khác (chừa 24px) */
  findFreeY(x: number, y: number, width: number, height: number): number {
    const others = (this.store.graph?.getNodes() || []).map((n: any) => n.getBBox());
    const hits = (top: number) =>
      others.some(
        (b: any) => x < b.x + b.width + 24 && x + width + 24 > b.x && top < b.y + b.height + 24 && top + height > b.y - 24,
      );
    let top = y;
    for (let i = 0; i < 20 && hits(top); i++) top += 120;
    return top;
  }
}
