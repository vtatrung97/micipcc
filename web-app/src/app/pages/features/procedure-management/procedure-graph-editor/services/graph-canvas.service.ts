import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { edgeAttrs, EDGE_COLOR, EDGE_ACTIVE_COLOR } from '../config/edge-style.config';
import { NODE_COLORS, NODE_SHADOW, NODE_SHADOW_HOVER } from '../config/node-view.config';
import { isGatewayType } from '../models/node-type';

declare const X6: any;
import { validateBpmnConnection } from '../config/ports.config';
import { GraphEditorStore } from '../state/graph-editor.store';
import { NodeEditorService } from './node-editor.service';
import { GraphBridgeService } from './graph-bridge.service';
import { GraphHistoryService } from './graph-history.service';
import { Graph, Scroller } from '@antv/x6';

/** Giới hạn thu phóng: 50% → 500% (nút +/−, Ctrl + cuộn chuột, căn vừa màn hình) */
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 5;
/** "Căn vừa màn hình" không phóng quá 125% với sơ đồ nhỏ */
const FIT_MAX = 1.25;

/** Khởi tạo X6 Graph, đăng ký sự kiện canvas, zoom, chế độ kéo canvas. */
@Injectable()
export class GraphCanvasService {
  constructor(
    private translate: TranslateService,
    private store: GraphEditorStore,
    private editor: NodeEditorService,
    public bridgeService: GraphBridgeService,
    private history: GraphHistoryService,
  ) {}

  /** Dịch key trong PROCESS_GRAPH.* (xem i18n/vi.json, en.json) */
  private t(key: string, params?: Record<string, any>): string {
    return this.translate.instant('PROCESS_GRAPH.' + key, params);
  }


  /** Đổi màu nét + mũi tên của dây (hover / chọn / bỏ chọn) */
  public setEdgeColor(edge: any, color: string, width: number): void {
    edge.attr('line/stroke', color);
    edge.attr('line/strokeWidth', width);
    edge.attr('line/targetMarker/fill', color);
    edge.attr('line/targetMarker/stroke', color);
  }

  /** Tạo X6 Graph trong `container` và đăng ký sự kiện canvas */
  public initGraph(container: HTMLElement): void {
    const GraphClass =
      typeof Graph !== 'undefined'
        ? Graph
        : typeof X6 !== 'undefined'
          ? X6.Graph || X6
          : (window as any).X6?.Graph;

    this.store.graph = new GraphClass({
      container,
      autoResize: true,
      // Chỉ xem: tắt kéo node, kéo dây, sửa edge
      ...(this.store.isReadonly ? { interacting: false } : {}),
      // Nền canvas xám nhạt, lưới chấm
      grid: {
        size: 16,
        visible: true,
        type: 'dot',
        args: {
          color: '#d4d4d4',
          thickness: 1.2,
        },
      },
      background: {
        color: '#f5f5f5',
      },
      scroller: {
        enabled: true,
        pannable: true,
      },
      connecting: {
        snap: true,
        allowBlank: false,
        allowMulti: false,
        allowLoop: false,
        highlight: true,
        // Dây bo cong mềm ở góc
        connector: {
          name: 'rounded',
          args: {
            radius: 16,
          },
        },
        router: {
          name: 'manhattan',
          args: {
            step: 10,
            padding: 24,
            startDirections: ['right', 'bottom'],
            endDirections: ['left', 'top'],
          },
        },
        // Dây kết thúc ở mép chấm cổng để mũi tên không bị chấm cổng / card che mất
        connectionPoint: 'boundary',
        // Edge tạo khi người dùng kéo dây: nét xám + mũi tên
        createEdge: () => this.store.graph.createEdge({ shape: 'edge', attrs: edgeAttrs(), zIndex: 0 }),
        validateConnection: (params: any) => {
          return validateBpmnConnection({ ...params, graph: this.store.graph });
        },
      },
      panning: {
        enabled: true,
        modifiers: 'space',
      },
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: 'ctrl',
        minScale: ZOOM_MIN,
        maxScale: ZOOM_MAX,
      },
    });

    if (
      typeof Scroller !== 'undefined' &&
      !this.store.graph.getPlugin?.('scroller')
    ) {
      try {
        this.store.graph.use(
          new Scroller({
            enabled: true,
            pannable: true,
          }),
        );
      } catch (e) {
        console.warn('Scroller notice:', e);
      }
    }

    // Hover node: đổ bóng đậm hơn
    this.store.graph.on('node:mouseenter', ({ node }: { node: any }) => {
      node.attr('body/filter', NODE_SHADOW_HOVER);
    });

    this.store.graph.on('node:mouseleave', ({ node }: { node: any }) => {
      node.attr('body/filter', NODE_SHADOW);
    });

    // Nút × trên card (attr event 'node:delete' trong node-view.config)
    this.store.graph.on('node:delete', ({ node, e }: { node: any; e: any }) => {
      e?.stopPropagation?.();
      if (this.store.isReadonly) return;
      this.editor.deleteNode(node);
      this.highlightSelectedNode();
    });

    // Edge Hover Highlight
    this.store.graph.on('edge:mouseenter', ({ edge }: { edge: any }) => {
      this.setEdgeColor(edge, EDGE_ACTIVE_COLOR, 2);
    });

    this.store.graph.on('edge:mouseleave', ({ edge }: { edge: any }) => {
      if (this.store.selectedCell !== edge) {
        this.setEdgeColor(edge, EDGE_COLOR, 1.5);
      }
    });

    this.store.graph.on('edge:click', ({ edge }: { edge: any }) => {
      this.editor.resetPreviousEdgeHighlight();
      this.store.selectedCell = edge;
      this.setEdgeColor(edge, EDGE_ACTIVE_COLOR, 2);
      this.store.selectedNode = null;
      this.store.isDrawerOpen = false;
      this.bridgeService.clearSelection();
      this.store.selectedCellInfo = this.t('STATUS.EDGE_SELECTED', { id: edge.id.substring(0, 8) });
    });

    // 4. KHI CLICK VÀO NODE -> MỞ DRAWER BÊN PHẢI QUA BRIDGE SERVICE (FR-05)
    this.store.graph.on('node:click', ({ node, e }: { node: any; e: any }) => {
      // Bấm nút × đã xoá node → bỏ qua click
      if (!this.store.graph.hasCell(node.id) || e?.target?.getAttribute?.('event') === 'node:delete') return;
      this.editor.resetPreviousEdgeHighlight();
      this.editor.selectNode(node);
      this.highlightSelectedNode();
      this.store.isDrawerOpen = true;
      this.bridgeService.selectNode(node, this.store.selectedNodeProps);
    });

    this.store.graph.on('blank:click', () => {
      this.editor.resetPreviousEdgeHighlight();
      this.editor.clearSelection();
      this.highlightSelectedNode();
      this.bridgeService.clearSelection();
    });

    // Dây vừa nối: áp style chuẩn (nét liền, không nhãn text)
    this.store.graph.on('edge:connected', ({ edge }: { edge: any }) => {
      edge.setAttrs(edgeAttrs());
      edge.attr('line/strokeDasharray', null);
      edge.setLabels([]);
    });

    this.store.graph.on('cell:added', () => {
      this.store.updateCounts();
      this.history.pushHistorySnapshot();
      this.refreshGatewayAlerts();
    });

    this.store.graph.on('cell:removed', () => {
      this.store.updateCounts();
      this.history.pushHistorySnapshot();
      this.refreshGatewayAlerts();
    });

    this.store.graph.on('edge:connected', () => this.refreshGatewayAlerts());
    this.store.graph.on('node:change:ports', () => this.refreshGatewayAlerts());

    this.store.graph.on('scale', ({ sx }: { sx: number }) => {
      this.store.currentZoom = Math.round(sx * 100);
    });

    this.store.graph.getEdges()?.forEach((e: any) => e.setLabels([]));
  }


  /** Viền node đang chọn; node khác về viền mặc định */
  public highlightSelectedNode(): void {
    this.store.graph?.getNodes().forEach((n: any) => {
      n.attr('body/stroke', n === this.store.selectedNode ? NODE_COLORS.borderSelected : NODE_COLORS.border);
    });
  }

  /** Icon cảnh báo vàng trên gateway khi còn nhánh (cổng ra) chưa nối dây */
  public refreshGatewayAlerts(): void {
    const graph = this.store.graph;
    if (!graph) return;
    graph.getNodes().forEach((node: any) => {
      if (!isGatewayType(node.getData()?.type)) return;
      // Mọi nhánh (kể cả Mặc định và Lỗi) đều phải nối dây
      const outPorts = (node.getPorts() || []).filter((p: any) => p.group === 'outCondition');
      const connected = new Set(
        (graph.getOutgoingEdges(node) || []).map((edge: any) => edge.getSourcePortId?.()),
      );
      const missing = outPorts.some((p: any) => !connected.has(p.id));
      node.attr('alertIcon/display', missing ? 'block' : 'none');
    });
  }

  /**
   * "Căn vừa màn hình": chọn mức zoom để thấy trọn toàn bộ quy trình trong khung nhìn rồi đưa sơ đồ vào giữa.
   * Tính theo kích thước khung nhìn thật (scroller), giới hạn 25% → 125%.
   */
  public zoomToFit(): void {
    const graph = this.store.graph;
    if (!graph || graph.getNodes().length === 0) return;
    const scroller = graph.getPlugin?.('scroller');
    const viewport: HTMLElement = scroller?.container || graph.container;
    const { width, height } = viewport.getBoundingClientRect();
    // Khung bao theo toạ độ gốc của node (không phụ thuộc mức zoom hiện tại)
    const bbox = graph.getCellsBBox(graph.getNodes());
    if (!width || !height || !bbox.width || !bbox.height) return;

    const padding = 48;
    const scale = Math.min((width - padding * 2) / bbox.width, (height - padding * 2) / bbox.height);
    graph.zoomTo(Math.max(ZOOM_MIN, Math.min(scale, FIT_MAX)));
    (scroller?.centerContent ? scroller : graph).centerContent();
  }

  public zoomIn(): void {
    if (!this.store.graph) return;
    this.store.graph.zoom(0.1, { minScale: ZOOM_MIN, maxScale: ZOOM_MAX });
  }


  public zoomOut(): void {
    if (!this.store.graph) return;
    this.store.graph.zoom(-0.1, { minScale: ZOOM_MIN, maxScale: ZOOM_MAX });
  }


  public resetZoom(): void {
    if (!this.store.graph) return;
    this.store.graph.zoomTo(1);
    this.store.graph.centerContent();
  }


  public setCanvasMode(mode: 'select' | 'pan'): void {
    this.store.canvasMode = mode;
    if (!this.store.graph) return;
    if (mode === 'pan') {
      this.store.graph.enablePanning();
    } else {
      this.store.graph.disablePanning();
    }
  }
}
