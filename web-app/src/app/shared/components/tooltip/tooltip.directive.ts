import {
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewContainerRef
} from '@angular/core';
import { TooltipComponent, TooltipPlacement } from './tooltip.component';

/** Khoảng cách từ mũi tên tới đối tượng (mũi tên cao 6 + 2px thở) */
const OFFSET = 8;
const VIEWPORT_MARGIN = 8;
const OPPOSITE: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left'
};

let nextTooltipId = 0;

/**
 * Hiện tooltip khi hover / focus vào phần tử.
 *   <button appTooltip="Xoá quy trình">…</button>
 *   <span [appTooltip]="text" tooltipPlacement="right"></span>
 * Tooltip gắn vào <body> (position: fixed) nên không bị bảng / drawer có overflow cắt;
 * thiếu chỗ ở cạnh đã chọn thì tự lật sang cạnh đối diện.
 */
@Directive({ selector: '[appTooltip]' })
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') text: string | null | undefined = '';
  @Input() tooltipPlacement: TooltipPlacement = 'top';
  @Input() tooltipMaxWidth: number = 320;
  /** Trễ trước khi hiện (ms) */
  @Input() tooltipDelay: number = 100;
  @Input() tooltipDisabled: boolean = false;

  private ref: ComponentRef<TooltipComponent> | null = null;
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly id = `px-tooltip-${nextTooltipId++}`;

  constructor(
    private host: ElementRef<HTMLElement>,
    private vcr: ViewContainerRef
  ) {}

  @HostListener('mouseenter')
  @HostListener('focusin')
  onEnter(): void {
    if (this.tooltipDisabled || !this.text) return;
    this.clearTimer();
    this.showTimer = setTimeout(() => this.show(), this.tooltipDelay);
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  @HostListener('click')
  onLeave(): void {
    this.hide();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.hide();
  }

  ngOnDestroy(): void {
    this.hide();
  }

  private show(): void {
    if (this.ref) return;
    this.ref = this.vcr.createComponent(TooltipComponent);
    const instance = this.ref.instance;
    instance.text = String(this.text);
    instance.id = this.id;
    instance.maxWidth = this.tooltipMaxWidth;
    instance.placement = this.tooltipPlacement;

    const el = this.ref.location.nativeElement as HTMLElement;
    el.style.visibility = 'hidden';
    document.body.appendChild(el);
    this.ref.changeDetectorRef.detectChanges();

    this.position();
    this.host.nativeElement.setAttribute('aria-describedby', this.id);
    document.addEventListener('scroll', this.onScroll, true);
  }

  private hide(): void {
    this.clearTimer();
    if (!this.ref) return;
    document.removeEventListener('scroll', this.onScroll, true);
    this.host.nativeElement.removeAttribute('aria-describedby');
    this.ref.destroy();
    this.ref = null;
  }

  private onScroll = (): void => this.hide();

  private clearTimer(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
  }

  /** Đặt toạ độ theo cạnh mong muốn; tràn viewport thì lật cạnh, rồi kẹp trong màn hình */
  private position(): void {
    if (!this.ref) return;
    const el = this.ref.location.nativeElement as HTMLElement;
    const target = this.host.nativeElement.getBoundingClientRect();
    const tip = el.getBoundingClientRect();

    let placement = this.tooltipPlacement;
    if (!this.fits(placement, target, tip)) {
      const flipped = OPPOSITE[placement];
      if (this.fits(flipped, target, tip)) placement = flipped;
    }

    let top = 0;
    let left = 0;
    switch (placement) {
      case 'top':
        top = target.top - tip.height - OFFSET;
        left = target.left + target.width / 2 - tip.width / 2;
        break;
      case 'bottom':
        top = target.bottom + OFFSET;
        left = target.left + target.width / 2 - tip.width / 2;
        break;
      case 'left':
        top = target.top + target.height / 2 - tip.height / 2;
        left = target.left - tip.width - OFFSET;
        break;
      case 'right':
        top = target.top + target.height / 2 - tip.height / 2;
        left = target.right + OFFSET;
        break;
    }

    left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - tip.width - VIEWPORT_MARGIN));
    top = Math.max(VIEWPORT_MARGIN, Math.min(top, window.innerHeight - tip.height - VIEWPORT_MARGIN));

    this.ref.instance.placement = placement;
    this.ref.changeDetectorRef.detectChanges();
    el.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
    el.style.visibility = 'visible';
  }

  private fits(placement: TooltipPlacement, target: DOMRect, tip: DOMRect): boolean {
    switch (placement) {
      case 'top': return target.top - tip.height - OFFSET >= VIEWPORT_MARGIN;
      case 'bottom': return target.bottom + tip.height + OFFSET <= window.innerHeight - VIEWPORT_MARGIN;
      case 'left': return target.left - tip.width - OFFSET >= VIEWPORT_MARGIN;
      case 'right': return target.right + tip.width + OFFSET <= window.innerWidth - VIEWPORT_MARGIN;
    }
  }
}
