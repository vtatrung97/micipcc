import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

// Tái sử dụng các core services từ procedure-graph-editor mà không can thiệp hay sửa đổi component cũ
import { GraphEditorStore } from '@pages/features/procedure-management/procedure-graph-editor/state/graph-editor.store';
import { GraphBridgeService } from '@pages/features/procedure-management/procedure-graph-editor/services/graph-bridge.service';
import { GraphCanvasService } from '@pages/features/procedure-management/procedure-graph-editor/services/graph-canvas.service';
import { NodeFactoryService } from '@pages/features/procedure-management/procedure-graph-editor/services/node-factory.service';
import { NodeEditorService } from '@pages/features/procedure-management/procedure-graph-editor/services/node-editor.service';
import { GatewayJoinService } from '@pages/features/procedure-management/procedure-graph-editor/services/gateway-join.service';
import { GraphHistoryService } from '@pages/features/procedure-management/procedure-graph-editor/services/graph-history.service';
import { GraphLayoutService } from '@pages/features/procedure-management/procedure-graph-editor/services/graph-layout.service';
import { SampleFlowService } from '@pages/features/procedure-management/procedure-graph-editor/services/sample-flow.service';
import { FlowPersistenceService } from '@pages/features/procedure-management/procedure-graph-editor/services/flow-persistence.service';
import { GraphDialogService } from '@pages/features/procedure-management/procedure-graph-editor/services/graph-dialog.service';
import { ProcessVariableService } from '@pages/features/procedure-management/procedure-graph-editor/services/process-variable.service';
import { NodeIconService } from '@pages/features/procedure-management/procedure-graph-editor/services/node-icon.service';
import { NodePlacementService } from '@pages/features/procedure-management/procedure-graph-editor/services/node-placement.service';
import { FlowDefinition } from '@pages/features/procedure-management/procedure-graph-editor/models/flow-definition.model';
import { parseFlowJson } from '@pages/features/procedure-management/procedure-graph-editor/flow-definition/flow-definition.mapper';

/**
 * Component hiển thị sơ đồ quy trình dạng Read-Only dùng chung (Process Diagram Viewer).
 * Phục vụ cho:
 * 1. Phân hệ M2 - Quản lý tiến trình (Chi tiết tiến trình & Tô màu runtime status của Node/Edge).
 * 2. Phân hệ Ticket (Xem tiến độ luồng xử lý của Ticket).
 * 3. Bất kỳ màn hình nào cần hiển thị đồ thị quy trình chỉ xem.
 */
@Component({
  selector: 'app-process-diagram-viewer',
  templateUrl: './process-diagram-viewer.component.html',
  styleUrls: ['./process-diagram-viewer.component.scss'],
  providers: [
    // Scoped providers riêng để độc lập
    GraphEditorStore,
    GraphBridgeService,
    GraphCanvasService,
    NodeFactoryService,
    NodeEditorService,
    GatewayJoinService,
    GraphHistoryService,
    GraphLayoutService,
    SampleFlowService,
    FlowPersistenceService,
    GraphDialogService,
    ProcessVariableService,
    NodeIconService,
    NodePlacementService,
  ],
})
export class ProcessDiagramViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  /** Dữ liệu cấu trúc quy trình: chuỗi JSON, FlowDefinition, hoặc object flow */
  @Input() flowJson: string | FlowDefinition | any;

  /** Trạng thái runtime của từng Node: COMPLETED | ACTIVE | OVERDUE | SKIPPED | PENDING */
  @Input() nodeStates: Record<string, string> = {};

  /** Trạng thái runtime của từng Edge: TRAVERSED | SKIPPED | PENDING */
  @Input() edgeStates: Record<string, string> = {};

  /** Bật/tắt nút Căn vừa */
  @Input() showFitButton: boolean = true;

  /** Bật/tắt thanh chú thích Legend */
  @Input() showLegend: boolean = true;

  /** Chiều cao khung canvas */
  @Input() height: string = '380px';

  /** Bắn sự kiện khi click vào một Node trên sơ đồ */
  @Output() nodeClick = new EventEmitter<{ nodeId: string; node: any; data: any }>();

  private isGraphInitialized = false;

  constructor(
    public store: GraphEditorStore,
    private canvas: GraphCanvasService,
    private persistence: FlowPersistenceService,
  ) {
    // Khóa mọi hành vi kéo thả chỉnh sửa (Read-only mode)
    this.store.isReadonly = true;
  }

  ngAfterViewInit(): void {
    this.initGraph();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.isGraphInitialized) return;

    if (changes['flowJson'] && !changes['flowJson'].firstChange) {
      this.loadFlow();
    } else if (changes['nodeStates'] || changes['edgeStates']) {
      this.applyRuntimeStates();
    }
  }

  ngOnDestroy(): void {
    try {
      if (this.store.graph) {
        this.store.graph.dispose();
      }
    } catch (e) {
      // Ignored during destruction
    }
  }

  /** Căn vừa sơ đồ vào kích thước khung nhìn */
  public zoomToFit(): void {
    if (this.canvas) {
      this.canvas.zoomToFit();
    }
  }

  /** Khởi tạo X6 Graph trong container */
  private initGraph(): void {
    if (!this.containerRef?.nativeElement) return;

    this.canvas.initGraph(this.containerRef.nativeElement);
    this.isGraphInitialized = true;

    // Đăng ký sự kiện click node để bắn ra output
    this.store.graph.on('node:click', ({ node }: { node: any }) => {
      this.nodeClick.emit({
        nodeId: node.id,
        node,
        data: node.getData?.(),
      });
    });

    this.loadFlow();
  }

  /** Nạp dữ liệu vào canvas */
  private loadFlow(): void {
    if (!this.store.graph || !this.flowJson) return;

    try {
      let flowData = this.flowJson;
      if (typeof flowData === 'string') {
        flowData = JSON.parse(flowData);
      }

      // Trường hợp FlowDetailResponse từ API backend (có trường flowJson hoặc nodes)
      if (flowData.nodes && Array.isArray(flowData.nodes)) {
        // Kiểm tra xem đây là FlowDefinition hay X6 raw JSON
        const isFlowDef = flowData.nodes.length > 0 && ('type' in flowData.nodes[0]) && !('shape' in flowData.nodes[0]);
        if (isFlowDef) {
          this.persistence.renderFlowDefinition(flowData as FlowDefinition);
        } else {
          this.persistence.loadGraphData(flowData);
        }
      } else if (flowData.flowJson) {
        // Object bọc ngoài của template / instance
        const parsed = parseFlowJson(flowData);
        this.persistence.renderFlowDefinition(parsed);
      }

      // Áp dụng trạng thái tô màu
      this.applyRuntimeStates();

      // Căn vừa sơ đồ sau khi render xong DOM
      setTimeout(() => {
        this.zoomToFit();
      }, 80);
    } catch (err) {
      console.warn('ProcessDiagramViewer: Không thể nạp sơ đồ flowJson:', err);
    }
  }

  /** Áp dụng màu sắc và kiểu viền cho các Node và Edge theo trạng thái Runtime */
  public applyRuntimeStates(): void {
    if (!this.store.graph) return;

    // 1. Áp dụng trạng thái cho các Node
    const nodes = this.store.graph.getNodes?.() || [];
    nodes.forEach((node: any) => {
      const data = node.getData?.() || {};
      const nodeId = node.id;
      const state = (
        this.nodeStates[nodeId] ||
        this.nodeStates[data.id] ||
        this.nodeStates[data.stepCode] ||
        'PENDING'
      ).toUpperCase();

      this.styleNodeByState(node, state);
    });

    // 2. Áp dụng trạng thái cho các Edge (Dây kết nối)
    const edges = this.store.graph.getEdges?.() || [];
    edges.forEach((edge: any) => {
      const edgeId = edge.id;
      const state = (this.edgeStates[edgeId] || 'PENDING').toUpperCase();

      this.styleEdgeByState(edge, state);
    });
  }

  /** Tô màu node theo trạng thái */
  private styleNodeByState(node: any, state: string): void {
    try {
      switch (state) {
        case 'COMPLETED': // Đã thực thi (Xanh lá)
          node.attr('body/stroke', '#22c55e');
          node.attr('body/strokeWidth', 2);
          node.attr('body/fill', '#f0fdf4');
          node.attr('root/opacity', 1);
          break;

        case 'ACTIVE': // Đang xử lý (Xanh dương)
          node.attr('body/stroke', '#3b82f6');
          node.attr('body/strokeWidth', 2);
          node.attr('body/fill', '#eff6ff');
          node.attr('root/opacity', 1);
          break;

        case 'OVERDUE': // Quá hạn (Đỏ)
          node.attr('body/stroke', '#ef4444');
          node.attr('body/strokeWidth', 2);
          node.attr('body/fill', '#fef2f2');
          node.attr('root/opacity', 1);
          break;

        case 'SKIPPED': // Nhánh không đi qua (Mờ / Nét đứt)
          node.attr('body/stroke', '#94a3b8');
          node.attr('body/strokeWidth', 1);
          node.attr('body/strokeDasharray', '4 4');
          node.attr('root/opacity', 0.35);
          break;

        case 'PENDING': // Chưa tới (Xám)
        default:
          node.attr('body/stroke', '#cbd5e1');
          node.attr('body/strokeWidth', 1);
          node.attr('body/fill', '#ffffff');
          node.attr('root/opacity', 0.85);
          break;
      }
    } catch (e) {
      // Ignored if specific SVG attribute doesn't exist
    }
  }

  /** Tô màu dây theo trạng thái */
  private styleEdgeByState(edge: any, state: string): void {
    try {
      switch (state) {
        case 'TRAVERSED': // Luồng đã đi (Xanh lá nét liền)
        case 'COMPLETED':
          edge.attr('line/stroke', '#22c55e');
          edge.attr('line/strokeWidth', 2.5);
          edge.attr('line/strokeDasharray', '0');
          edge.attr('line/targetMarker/fill', '#22c55e');
          edge.attr('line/targetMarker/stroke', '#22c55e');
          edge.attr('root/opacity', 1);
          break;

        case 'SKIPPED': // Nhánh không đi qua (Xám nét đứt)
          edge.attr('line/stroke', '#94a3b8');
          edge.attr('line/strokeWidth', 1.5);
          edge.attr('line/strokeDasharray', '4 4');
          edge.attr('line/targetMarker/fill', '#94a3b8');
          edge.attr('line/targetMarker/stroke', '#94a3b8');
          edge.attr('root/opacity', 0.4);
          break;

        case 'PENDING': // Chưa tới (Xám nhạt)
        default:
          edge.attr('line/stroke', '#e2e8f0');
          edge.attr('line/strokeWidth', 1.5);
          edge.attr('line/strokeDasharray', '0');
          edge.attr('line/targetMarker/fill', '#cbd5e1');
          edge.attr('line/targetMarker/stroke', '#cbd5e1');
          edge.attr('root/opacity', 0.8);
          break;
      }
    } catch (e) {
      // Ignored if edge attribute is not accessible
    }
  }
}
