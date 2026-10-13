import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { normalizeNodeType } from '../models/node-type';
import { GraphEditorStore } from '../state/graph-editor.store';
import { GraphHistoryService } from './graph-history.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NODE_CARD_HEIGHT, NODE_CARD_WIDTH, NODE_HEADER_CENTER_Y } from '../config/node-view.config';

/** Khoảng cách giữa các cột (bước nối tiếp) và giữa các node cùng cột (nhánh song song) */
const COLUMN_GAP = 120;
const ROW_GAP = 48;
const ORIGIN_X = 80;
const ORIGIN_Y = 200;

interface LayoutEdge {
  source: string;
  sourcePort?: string;
  target: string;
  targetPort?: string;
}

/**
 * "Sắp xếp lại quy trình" theo lớp trái → phải: bỏ cạnh quay vòng, cột = đường dài nhất từ Bắt đầu;
 * trong cột, cổng vào thẳng hàng cổng ra bước trước (trung bình nếu nhiều nguồn), giữ thứ tự cổng ra
 * để dây không cắt nhau, rồi đẩy xuống theo chiều cao thật của card để không chồng lấn.
 */
@Injectable()
export class GraphLayoutService {
  constructor(
    private translate: TranslateService,
    private store: GraphEditorStore,
    private history: GraphHistoryService,
    private message: NzMessageService
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }

  /**
   * "Làm đẹp quy trình". Người dùng bấm: chỉ chạy khi mọi bước nằm trên luồng từ Bắt đầu tới Kết thúc,
   * không thì báo và giữ nguyên bố cục. Trả về true nếu đã sắp xếp.
   * @param silent true: dựng flow mẫu — bỏ kiểm tra, không ghi lịch sử
   */
  public autoLayout(silent: boolean = false): boolean {
    const graph = this.store.graph;
    if (!graph) return false;
    const nodes: any[] = graph.getNodes();
    if (nodes.length === 0) return false;
    if (!silent && !this.isFlowConnected(graph, nodes)) {
      this.message.warning(this.t('MESSAGES.AUTO_LAYOUT_INVALID'));
      return false;
    }

    // Bỏ điểm bẻ cong thủ công để router tính lại đường nối
    graph.getEdges().forEach((edge: any) => edge.setVertices([]));

    const byId = new Map<string, any>(nodes.map((n) => [n.id, n]));
    const edges: LayoutEdge[] = graph
      .getEdges()
      .map((e: any) => ({
        source: e.getSourceCellId?.(),
        sourcePort: e.getSourcePortId?.(),
        target: e.getTargetCellId?.(),
        targetPort: e.getTargetPortId?.(),
      }))
      .filter((e: LayoutEdge) => byId.has(e.source) && byId.has(e.target) && e.source !== e.target);

    const connected = new Set<string>();
    edges.forEach((e) => { connected.add(e.source); connected.add(e.target); });
    const isStart = (n: any) => normalizeNodeType(n.getData()?.type) === 'START';
    const flowNodes = nodes.filter((n) => connected.has(n.id) || isStart(n));
    const isolatedNodes = nodes.filter((n) => !flowNodes.includes(n));

    // 1. Loại cạnh quay vòng bằng DFS (cạnh trỏ về node đang trên ngăn xếp)
    const dagEdges = this.removeBackEdges(flowNodes, edges);

    // 2. Cột = đường dài nhất (topo Kahn)
    const level = this.longestPathLevels(flowNodes, dagEdges);
    const columns: any[][] = [];
    flowNodes.forEach((n) => (columns[level.get(n.id) || 0] ||= []).push(n));

    // X của từng cột theo bề rộng lớn nhất trong cột
    const colX: number[] = [];
    let x = ORIGIN_X;
    columns.forEach((col, i) => {
      colX[i] = x;
      const width = Math.max(...(col || []).map((n) => n.getSize().width), NODE_CARD_WIDTH);
      x += width + COLUMN_GAP;
    });

    // 3. Y theo cổng của bước trước
    const top = new Map<string, number>();
    columns.forEach((col, ci) => {
      if (!col) return;
      const placed = col.map((node, order) => {
        const incoming = dagEdges.filter((e) => e.target === node.id && top.has(e.source));
        let desiredPortY = ORIGIN_Y;
        if (incoming.length) {
          const ys = incoming.map((e) => top.get(e.source)! + this.portY(byId.get(e.source), e.sourcePort));
          desiredPortY = ys.reduce((a, b) => a + b, 0) / ys.length;
        } else if (ci > 0 || order > 0) {
          desiredPortY = ORIGIN_Y + order * (NODE_CARD_HEIGHT + ROW_GAP);
        }
        const inY = this.inPortY(node, incoming[0]?.targetPort);
        return { node, desiredTop: desiredPortY - inY, order };
      });

      // Sắp theo vị trí mong muốn (giữ thứ tự cổng ra), rồi gỡ chồng lấn theo chiều cao thật
      placed.sort((a, b) => a.desiredTop - b.desiredTop || a.order - b.order);
      let bottom = -Infinity;
      placed.forEach((p) => {
        const y = Math.max(p.desiredTop, bottom + ROW_GAP);
        top.set(p.node.id, y);
        bottom = y + p.node.getSize().height;
      });
    });

    // Đặt toạ độ (mép trái theo cột)
    flowNodes.forEach((n) => {
      const ci = level.get(n.id) || 0;
      n.setPosition(Math.round(colX[ci]), Math.round(top.get(n.id) ?? ORIGIN_Y));
    });

    // 4. Node chưa nối dây: xếp hàng dưới sơ đồ chính
    if (isolatedNodes.length > 0) {
      let maxBottom = ORIGIN_Y;
      flowNodes.forEach((n) => (maxBottom = Math.max(maxBottom, n.getPosition().y + n.getSize().height)));
      let stagingX = ORIGIN_X;
      isolatedNodes.forEach((n) => {
        n.setPosition(stagingX, maxBottom + 96);
        stagingX += n.getSize().width + 40;
      });
    }

    graph.centerContent();
    if (silent) return true;
    this.history.pushHistorySnapshot();
    this.store.selectedCellInfo = this.t('STATUS.AUTO_LAYOUT');
    return true;
  }

  /** Mọi bước đi tới được từ Bắt đầu và đi tiếp tới được một Kết thúc (không có bước cô lập / cụt) */
  private isFlowConnected(graph: any, nodes: any[]): boolean {
    const out = new Map<string, string[]>();
    const back = new Map<string, string[]>();
    graph.getEdges().forEach((e: any) => {
      const s = e.getSourceCellId();
      const t = e.getTargetCellId();
      if (!s || !t) return;
      out.set(s, [...(out.get(s) || []), t]);
      back.set(t, [...(back.get(t) || []), s]);
    });
    const typeOf = (n: any) => normalizeNodeType(n.getData()?.type, n.getData()?.gatewayType);
    const starts = nodes.filter((n) => typeOf(n) === 'START').map((n) => n.id);
    const ends = nodes.filter((n) => typeOf(n) === 'END').map((n) => n.id);
    if (!starts.length || !ends.length) return false;
    const reach = (from: string[], adj: Map<string, string[]>) => {
      const seen = new Set<string>(from);
      const queue = [...from];
      while (queue.length) {
        (adj.get(queue.shift()!) || []).forEach((next) => {
          if (!seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
        });
      }
      return seen;
    };
    const fromStart = reach(starts, out);
    const toEnd = reach(ends, back);
    return nodes.every((n) => fromStart.has(n.id) && toEnd.has(n.id));
  }

  /** Y (trong node) của cổng: cổng đặt tuyệt đối dùng args.y, còn lại ở giữa chiều cao */
  private portY(node: any, portId?: string): number {
    const port = portId ? node.getPort?.(portId) : null;
    if (port?.args?.y != null) return port.args.y;
    if (port?.group === 'inHeader') return NODE_HEADER_CENTER_Y;
    return node.getSize().height / 2;
  }

  private inPortY(node: any, portId?: string): number {
    const port = portId ? node.getPort?.(portId) : (node.getPorts?.() || []).find((p: any) => String(p.group).startsWith('in'));
    if (port?.group === 'inHeader') return NODE_HEADER_CENTER_Y;
    if (port?.args?.y != null) return port.args.y;
    return node.getSize().height / 2;
  }

  private removeBackEdges(nodes: any[], edges: LayoutEdge[]): LayoutEdge[] {
    const out = new Map<string, LayoutEdge[]>();
    edges.forEach((e) => (out.get(e.source) || out.set(e.source, []).get(e.source)!).push(e));
    const state = new Map<string, 1 | 2>(); // 1 = đang duyệt, 2 = xong
    const back = new Set<LayoutEdge>();
    const visit = (id: string) => {
      state.set(id, 1);
      (out.get(id) || []).forEach((e) => {
        const s = state.get(e.target);
        if (s === 1) back.add(e);
        else if (!s) visit(e.target);
      });
      state.set(id, 2);
    };
    const roots = nodes.filter((n) => !edges.some((e) => e.target === n.id));
    [...roots, ...nodes].forEach((n) => !state.has(n.id) && visit(n.id));
    return edges.filter((e) => !back.has(e));
  }

  private longestPathLevels(nodes: any[], edges: LayoutEdge[]): Map<string, number> {
    const level = new Map<string, number>(nodes.map((n) => [n.id, 0]));
    const indeg = new Map<string, number>(nodes.map((n) => [n.id, 0]));
    edges.forEach((e) => indeg.set(e.target, (indeg.get(e.target) || 0) + 1));
    const queue = nodes.filter((n) => !indeg.get(n.id)).map((n) => n.id);
    while (queue.length) {
      const id = queue.shift()!;
      edges.filter((e) => e.source === id).forEach((e) => {
        level.set(e.target, Math.max(level.get(e.target) || 0, (level.get(id) || 0) + 1));
        indeg.set(e.target, (indeg.get(e.target) || 0) - 1);
        if (indeg.get(e.target) === 0) queue.push(e.target);
      });
    }
    return level;
  }
}
