import { Component, ElementRef, HostListener, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { NODE_ICON_BG } from '../config/node-view.config';
import { NodeType } from '../models/node-type';
import { NodePlacementService } from '../services/node-placement.service';
import { NodeIconService } from '../services/node-icon.service';
import { GraphEditorStore } from '../state/graph-editor.store';
import { TranslateService } from '@ngx-translate/core';

/** Nút "+ Thêm bước" đặt cạnh một cổng ra chưa nối */
interface AddStepAnchor {
  key: string;
  nodeId: string;
  portId: string;
  /** Toạ độ trong khung canvas (px) */
  left: number;
  top: number;
  /** Các cổng của cùng node quá sát nhau (dòng nhánh) → nút thu nhỏ để không chồng lên nhau */
  isCompact: boolean;
}

interface StepOption {
  type: NodeType;
  title: string;
}

const GATEWAY_TYPES: NodeType[] = ['GATEWAY_EXCLUSIVE', 'GATEWAY_PARALLEL', 'GATEWAY_INCLUSIVE'];
const STEP_TYPES: NodeType[] = ['USER_TASK', 'SYSTEM_TASK', 'NOTIFICATION', 'SUB_PROCESS', 'END'];
const MENU_WIDTH = 320;
const MENU_HEIGHT = 444;

/**
 * Lớp phủ trên canvas: hiện nút "+ Thêm bước" sau mỗi cổng ra chưa nối (trừ node Kết thúc),
 * bấm mở menu chọn loại bước → tạo bước mới bên phải và nối cạnh từ cổng đó.
 */
@Component({
  selector: 'app-add-step-overlay',
  templateUrl: './add-step-overlay.component.html',
  styleUrls: ['./add-step-overlay.component.scss'],
})
export class AddStepOverlayComponent implements OnDestroy {
  anchors: AddStepAnchor[] = [];
  /** Nút đang mở menu */
  openAnchor: AddStepAnchor | null = null;
  menuLeft: number = 0;
  menuTop: number = 0;
  /** Danh sách đã lọc — giữ nguyên mảng giữa các lần change detection để DOM nút không bị dựng lại (mất click) */
  conditionOptions: StepOption[] = [];
  stepOptions: StepOption[] = [];

  private _keyword: string = '';

  get keyword(): string {
    return this._keyword;
  }

  set keyword(value: string) {
    this._keyword = value;
    this.conditionOptions = this.filterOptions(GATEWAY_TYPES);
    this.stepOptions = this.filterOptions(STEP_TYPES);
  }

  /** Mở menu là focus ô tìm kiếm */
  @ViewChild('searchInput') set searchInput(ref: ElementRef<HTMLInputElement> | undefined) {
    if (ref) setTimeout(() => ref.nativeElement.focus());
  }

  private graph: any = null;
  private frame: number | null = null;
  private readonly scheduleRefresh = () => this.requestRefresh();

  constructor(
    private host: ElementRef<HTMLElement>,
    private zone: NgZone,
    private store: GraphEditorStore,
    private placement: NodePlacementService,
    private icons: NodeIconService,
    private translate: TranslateService,
  ) {}

  /** Gắn vào graph sau khi canvas khởi tạo xong */
  attach(): void {
    this.graph = this.store.graph;
    if (!this.graph) return;
    ['cell:added', 'cell:removed', 'cell:changed', 'scale', 'translate', 'resize', 'render:done'].forEach((evt) =>
      this.graph.on(evt, this.scheduleRefresh),
    );
    // Scroller cuộn bằng scroll của DOM, không phát event của graph
    this.host.nativeElement.parentElement?.addEventListener('scroll', this.scheduleRefresh, true);
    this.requestRefresh();
  }

  ngOnDestroy(): void {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.host.nativeElement.parentElement?.removeEventListener('scroll', this.scheduleRefresh, true);
    if (this.graph) {
      ['cell:added', 'cell:removed', 'cell:changed', 'scale', 'translate', 'resize', 'render:done'].forEach((evt) =>
        this.graph.off(evt, this.scheduleRefresh),
      );
    }
  }

  trackByType(_: number, option: StepOption): string {
    return option.type;
  }

  iconSrc(type: NodeType): string {
    return this.icons.getPaletteIconSrc(type);
  }

  iconBg(type: NodeType): string {
    return type === 'END' ? '#fff0f3' : NODE_ICON_BG[type];
  }

  trackByKey(_: number, anchor: AddStepAnchor): string {
    return anchor.key;
  }

  /** Mở menu dưới nút; thiếu chỗ phía dưới thì mở lên trên */
  toggleMenu(anchor: AddStepAnchor, event: MouseEvent): void {
    event.stopPropagation();
    if (this.openAnchor?.key === anchor.key) {
      this.closeMenu();
      return;
    }
    const hostRect = this.host.nativeElement.getBoundingClientRect();
    const btnBottom = anchor.top + 14;
    this.menuLeft = Math.max(8, Math.min(anchor.left, hostRect.width - MENU_WIDTH - 8));
    this.menuTop =
      btnBottom + 8 + MENU_HEIGHT <= hostRect.height ? btnBottom + 8 : Math.max(8, anchor.top - 14 - 8 - MENU_HEIGHT);
    this.keyword = '';
    this.openAnchor = anchor;
  }

  closeMenu(): void {
    this.openAnchor = null;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(event: MouseEvent): void {
    if (!this.openAnchor) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.add-step-menu') && !target.closest('.add-step-btn')) this.closeMenu();
  }

  /** Thêm bước như kéo từ Thư viện bước, đặt bên phải bước nguồn và nối cạnh từ cổng đã bấm */
  addStep(type: NodeType): void {
    const anchor = this.openAnchor;
    this.closeMenu();
    if (anchor) this.placement.placeNodeAfter(type, { nodeId: anchor.nodeId, portId: anchor.portId });
  }

  private filterOptions(types: NodeType[]): StepOption[] {
    const kw = this.normalize(this._keyword);
    return types
      .map((type) => ({ type, title: this.translate.instant(`PROCESS_GRAPH.PALETTE.ITEMS.${type}.TITLE`) }))
      .filter((o) => !kw || this.normalize(o.title).includes(kw));
  }

  /** Bỏ dấu tiếng Việt để tìm "giao viec" vẫn ra "Giao việc" */
  private normalize(text: string): string {
    return (text || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  }

  private requestRefresh(): void {
    if (this.frame !== null) return;
    this.zone.runOutsideAngular(() => {
      this.frame = requestAnimationFrame(() => {
        this.frame = null;
        this.zone.run(() => this.refreshAnchors());
      });
    });
  }

  /** Tìm các cổng ra chưa nối và vị trí nút tương ứng (bám theo cổng trên màn hình) */
  private refreshAnchors(): void {
    const graph = this.graph;
    if (!graph) return;
    const hostRect = this.host.nativeElement.getBoundingClientRect();
    const anchors: AddStepAnchor[] = [];

    graph.getNodes().forEach((node: any) => {
      if (node.getData()?.type === 'END') return;
      const used = new Set((graph.getOutgoingEdges(node) || []).map((e: any) => e.getSourcePortId()));
      const view = graph.findViewByCell(node);
      node.getPorts().forEach((port: any) => {
        if (String(port.group || '').startsWith('in') || used.has(port.id)) return;
        const el = view?.findPortElem(port.id, 'portCircle');
        if (!el) return;
        const r = el.getBoundingClientRect();
        const left = r.right - hostRect.left + 10;
        const top = r.top + r.height / 2 - hostRect.top;
        if (left < 0 || top < 0 || left > hostRect.width || top > hostRect.height) return;
        anchors.push({ key: `${node.id}:${port.id}`, nodeId: node.id, portId: port.id, left, top, isCompact: false });
      });
    });

    anchors.forEach((a) => {
      a.isCompact = anchors.some((b) => b !== a && b.nodeId === a.nodeId && Math.abs(b.top - a.top) < 30);
    });
    this.anchors = anchors;
    // Cổng đang mở menu đã được nối / node bị xoá → đóng menu
    if (this.openAnchor && !anchors.some((a) => a.key === this.openAnchor!.key)) this.closeMenu();
  }
}
