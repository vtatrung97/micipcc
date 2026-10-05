import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { edgeAttrs, EDGE_COLOR, EDGE_ACTIVE_COLOR } from '../config/edge-style.config';

declare const X6: any;
import { validateBpmnConnection } from '../config/ports.config';
import { GraphEditorStore } from '../state/graph-editor.store';
import { NodeEditorService } from './node-editor.service';
import { GraphBridgeService } from './graph-bridge.service';
import { GraphHistoryService } from './graph-history.service';
import { Graph, Scroller } from '@antv/x6';

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
      grid: {
        size: 15,
        visible: true,
        type: 'dot',
        args: {
          color: '#cbd5e1',
          thickness: 1.2,
        },
      },
      background: {
        color: '#f8fafc',
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
        connector: {
          name: 'rounded',
          args: {
            radius: 8,
          },
        },
        router: {
          name: 'manhattan',
          args: {
            step: 10,
            padding: 10,
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
        minScale: 0.4,
        maxScale: 2.2,
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

    // Node Hover Highlight (Ant Design monochrome style)
    this.store.graph.on('node:mouseenter', ({ node }: { node: any }) => {
      if (this.store.selectedNode !== node) {
        node.attr('body/stroke', '#1677ff');
      }
    });

    this.store.graph.on('node:mouseleave', ({ node }: { node: any }) => {
      if (this.store.selectedNode !== node) {
        node.attr('body/stroke', '#e2e8f0');
      }
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
    this.store.graph.on('node:click', ({ node }: { node: any }) => {
      this.editor.resetPreviousEdgeHighlight();
      this.editor.selectNode(node);
      this.store.isDrawerOpen = true;
      this.bridgeService.selectNode(node, this.store.selectedNodeProps);
    });

    this.store.graph.on('blank:click', () => {
      this.editor.resetPreviousEdgeHighlight();
      this.editor.clearSelection();
      this.bridgeService.clearSelection();
    });

    // Tự động thiết lập style dây nối #94a3b8 khi nối dây (đồng bộ nét liền chuẩn, không sinh line riêng hay nhãn text)
    this.store.graph.on('edge:connected', ({ edge }: { edge: any }) => {
      edge.setAttrs(edgeAttrs());
      edge.attr('line/strokeDasharray', null);
      edge.setLabels([]);
    });

    this.store.graph.on('cell:added', () => {
      this.store.updateCounts();
      this.history.pushHistorySnapshot();
    });

    this.store.graph.on('cell:removed', () => {
      this.store.updateCounts();
      this.history.pushHistorySnapshot();
    });

    this.store.graph.on('scale', ({ sx }: { sx: number }) => {
      this.store.currentZoom = Math.round(sx * 100);
    });

    this.store.graph.getEdges()?.forEach((e: any) => e.setLabels([]));
  }


  public zoomIn(): void {
    if (!this.store.graph) return;
    this.store.graph.zoom(0.1);
  }


  public zoomOut(): void {
    if (!this.store.graph) return;
    this.store.graph.zoom(-0.1);
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
