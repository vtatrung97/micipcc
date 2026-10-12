import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
  ViewChild
} from '@angular/core';

/** Một mục trong menu hành động */
export interface ActionMenuItem {
  key: string;
  label: string;
  /** Đường dẫn icon 20px đặt trước nhãn (vd: 'assets/icons/processx/copy.svg') */
  icon?: string;
  /** Mục nguy hiểm (vd: Xóa) → chữ đỏ */
  danger?: boolean;
  disabled?: boolean;
}

const PANEL_GAP = 4;
const VIEWPORT_MARGIN = 8;

/**
 * Nút "⋮" mở menu hành động.
 * Menu dùng position: fixed để không bị cắt bởi vùng cuộn ngang của bảng (`app-data-table`).
 */
@Component({
  selector: 'app-action-menu',
  templateUrl: './action-menu.component.html',
  styleUrls: ['./action-menu.component.scss']
})
export class ActionMenuComponent implements OnDestroy {
  @Input() items: ActionMenuItem[] = [];
  @Input() disabled: boolean = false;
  /** Tooltip / aria-label của nút ⋮ */
  @Input() title: string = 'Thêm hành động';

  /** Phát `key` của mục được chọn */
  @Output() action = new EventEmitter<string>();

  @ViewChild('trigger') trigger?: ElementRef<HTMLButtonElement>;
  @ViewChild('panel') panel?: ElementRef<HTMLDivElement>;

  readonly dotsIcon = 'assets/icons/processx/dots-vertical.svg';

  isOpen: boolean = false;
  panelTop: number = 0;
  panelLeft: number = 0;
  /** Ẩn panel trong khung hình đầu tiên cho tới khi đo xong kích thước */
  measured: boolean = false;

  constructor(private elRef: ElementRef<HTMLElement>) {}

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.isOpen ? this.close() : this.open();
  }

  choose(item: ActionMenuItem, event: MouseEvent): void {
    event.stopPropagation();
    if (item.disabled) return;
    this.close();
    this.action.emit(item.key);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
      this.trigger?.nativeElement.focus();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isOpen) this.close();
  }

  ngOnDestroy(): void {
    document.removeEventListener('scroll', this.onAnyScroll, true);
  }

  /**
   * Cuộn trang hoặc cuộn bất kỳ vùng nào (vd: bảng cuộn ngang) → đóng menu để không lệch khỏi nút.
   * Sự kiện scroll không nổi bọt nên phải nghe ở pha capture.
   */
  private onAnyScroll = (event: Event): void => {
    if (this.panel && this.panel.nativeElement.contains(event.target as Node)) return;
    this.close();
  };

  private open(): void {
    this.isOpen = true;
    document.addEventListener('scroll', this.onAnyScroll, true);
    this.measured = false;
    // Đợi panel render để đo rồi mới đặt vị trí (căn phải theo nút, thiếu chỗ thì mở lên trên)
    setTimeout(() => this.position());
  }

  private close(): void {
    this.isOpen = false;
    document.removeEventListener('scroll', this.onAnyScroll, true);
  }

  private position(): void {
    if (!this.trigger || !this.panel) return;
    // Đưa panel ra <body>: ô chứa nút (vd: cột Hành động `position: sticky; z-index: 1` của app-data-table)
    // tạo stacking context riêng nên z-index của panel không vượt được các hàng phía dưới.
    // Angular gỡ node theo parentNode thực tế nên *ngIf vẫn xóa panel bình thường khi đóng.
    const panelEl = this.panel.nativeElement;
    if (panelEl.parentNode !== document.body) document.body.appendChild(panelEl);

    const btn = this.trigger.nativeElement.getBoundingClientRect();
    const panel = this.panel.nativeElement.getBoundingClientRect();

    let left = btn.right - panel.width;
    left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - panel.width - VIEWPORT_MARGIN));

    const spaceBelow = window.innerHeight - btn.bottom;
    const top = spaceBelow >= panel.height + PANEL_GAP + VIEWPORT_MARGIN || btn.top < panel.height
      ? btn.bottom + PANEL_GAP
      : btn.top - panel.height - PANEL_GAP;

    this.panelLeft = left;
    this.panelTop = top;
    this.measured = true;
  }
}
