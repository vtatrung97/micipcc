import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';

/**
 * Khung bảng theo Figma ProcessX ("Table_view", node 71:12889).
 * Chiếu <table> của feature qua ng-content; component lo khung card, style header/cell,
 * hàng xen kẽ, cột hành động cố định bên phải, loading, empty state và pagination.
 *
 * Class tiện ích dùng trong <td> (xem README ở ui-kit):
 * - `px-cell-check`   : checkbox + STT (gap 12)
 * - `px-cell-stack`   : 2 dòng (dòng chính 14/20 + `px-cell-sub` 12/18 xám)
 * - `px-cell-actions` : cụm nút icon hành động; nút dùng class `px-cell-action-btn` (36 × 36)
 */
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements AfterViewInit, OnDestroy {
  @Input() loading: boolean = false;
  @Input() loadingTip: string = 'Đang tải dữ liệu từ máy chủ...';
  @Input() loadingType: 'spinner' | 'dots' | 'skeleton' = 'spinner';
  @Input() loadingColor: string = '#ed0231';
  @Input() total: number = 0;
  @Input() page: number = 1;
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];
  @Input() showPagination: boolean = true;
  @Input() skeletonRows: number = 4;
  @Input() emptyTitle?: string;
  @Input() emptyDescription?: string;
  /** Cố định cột cuối (Hành động) bên phải khi bảng cuộn ngang */
  @Input() fixedLastColumn: boolean = true;
  /** Tô nền xen kẽ các hàng (trắng / #F7F7F7) */
  @Input() striped: boolean = true;

  @Output() onPageChange = new EventEmitter<number>();
  @Output() onPageSizeChange = new EventEmitter<number>();

  @ViewChild('scroller', { static: true }) scrollerRef!: ElementRef<HTMLDivElement>;

  /** Bảng rộng hơn khung và chưa cuộn tới mép phải → hiện đường viền / bóng cho cột cố định */
  public showFixedShadow = false;

  private resizeObserver?: ResizeObserver;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    const el = this.scrollerRef.nativeElement;
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.updateFixedShadow());
      this.resizeObserver.observe(el);
      if (el.firstElementChild) this.resizeObserver.observe(el.firstElementChild);
    }
    // Đo sau vòng change detection hiện tại, tránh NG0100 (ExpressionChangedAfterItHasBeenChecked) ở dev mode
    Promise.resolve().then(() => this.updateFixedShadow());
  }

  public updateFixedShadow(): void {
    const el = this.scrollerRef.nativeElement;
    const next = el.scrollWidth - el.clientWidth - el.scrollLeft > 1;
    if (next !== this.showFixedShadow) {
      this.zone.run(() => (this.showFixedShadow = next));
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
}
