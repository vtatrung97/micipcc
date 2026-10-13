import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ProcessTemplateItem } from '@core/services/template.service';
import { GraphEditorStore } from '../state/graph-editor.store';
import { GraphBridgeService } from '../services/graph-bridge.service';
import { GraphCanvasService } from '../services/graph-canvas.service';
import { NodeFactoryService } from '../services/node-factory.service';
import { NodeEditorService } from '../services/node-editor.service';
import { GatewayJoinService } from '../services/gateway-join.service';
import { GraphHistoryService } from '../services/graph-history.service';
import { GraphLayoutService } from '../services/graph-layout.service';
import { SampleFlowService } from '../services/sample-flow.service';
import { FlowPersistenceService } from '../services/flow-persistence.service';
import { GraphDialogService } from '../services/graph-dialog.service';
import { ProcessVariableService } from '../services/process-variable.service';
import { NodeIconService } from '../services/node-icon.service';
import { NodePlacementService } from '../services/node-placement.service';
import { processInfoFromTemplate } from '../models/process-info.model';

/**
 * Canvas chỉ xem của một quy trình (popup xem quy trình con).
 * Có bộ service + bridge riêng nên không đụng tới canvas đang thiết kế; bấm node mở drawer ở chế độ xem.
 */
@Component({
  selector: 'app-process-viewer',
  templateUrl: './process-viewer.component.html',
  styleUrls: ['./process-viewer.component.scss'],
  providers: [
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
export class ProcessViewerComponent implements AfterViewInit {
  @Input() template!: ProcessTemplateItem;

  @ViewChild('container', { static: true }) containerRef!: ElementRef<HTMLDivElement>;

  constructor(
    public store: GraphEditorStore,
    private canvas: GraphCanvasService,
    private history: GraphHistoryService,
    private layout: GraphLayoutService,
    private samples: SampleFlowService,
    private persistence: FlowPersistenceService,
  ) {
    this.store.isReadonly = true;
  }

  ngAfterViewInit(): void {
    this.store.currentTemplate = this.template;
    this.store.processInfo = processInfoFromTemplate(this.template);
    this.canvas.initGraph(this.containerRef.nativeElement);
    this.loadFlow();
    // Đợi popup dựng xong kích thước rồi mới căn vừa khung
    setTimeout(() => this.canvas.zoomToFit());
  }

  undo(): void {
    this.history.undo();
  }

  redo(): void {
    this.history.redo();
  }

  zoomIn(): void {
    this.canvas.zoomIn();
  }

  zoomOut(): void {
    this.canvas.zoomOut();
  }

  resetZoom(): void {
    this.canvas.resetZoom();
  }

  zoomToFit(): void {
    this.canvas.zoomToFit();
  }

  autoLayout(): void {
    if (this.layout.autoLayout()) this.canvas.zoomToFit();
  }

  /** Nạp flow giống màn thiết kế: bản nháp đã lưu → thiết kế lưu sẵn → dữ liệu canvas → flow mẫu */
  private loadFlow(): void {
    const code = this.template.code;
    if (code && this.persistence.loadSavedDraft(code)) {
      // Đã vẽ từ bản nháp
    } else if (this.template.flowDefinition) {
      this.persistence.renderFlowDefinition(this.template.flowDefinition);
    } else if (this.template.graphData) {
      this.persistence.loadGraphData(this.template.graphData);
    } else {
      this.samples.loadSampleFlow('default');
    }
    const graph = this.store.graph;
    graph.getEdges()?.forEach((e: any) => e.setLabels([]));
    // Ẩn nút × xoá bước trên card
    graph.getNodes()?.forEach((n: any) => n.attr('closeBtn/display', 'none'));
    this.history.reset();
  }
}
