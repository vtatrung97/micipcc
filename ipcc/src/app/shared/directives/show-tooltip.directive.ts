import { Directive, ElementRef, Input, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective {
  @Input('appTooltip') tooltipText!: string;
  @Input() tooltipWidth?: string;
  @Input() tooltipHeight?: string;
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() tooltipBackground: string = '#333';
  @Input() tooltipColor: string = '#fff';

  private tooltipElement!: HTMLElement;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mouseenter')
  onMouseEnter() {
    if (!this.tooltipElement) {
      this.createTooltip();
    }
    this.setPosition();
    this.renderer.setStyle(this.tooltipElement, 'display', 'block');
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    // Delay một chút để kiểm tra xem chuột có vào tooltip không
    setTimeout(() => {
      if (!this.isHoveringTooltip) {
        this.renderer.setStyle(this.tooltipElement, 'display', 'none');
      }
    }, 100);
  }

  private isHoveringTooltip = false;

  private createTooltip() {
    this.tooltipElement = this.renderer.createElement('div');
    const text = this.renderer.createText(this.tooltipText);
    this.renderer.appendChild(this.tooltipElement, text);

    // style cơ bản
    this.renderer.setStyle(this.tooltipElement, 'position', 'fixed');
    this.renderer.setStyle(this.tooltipElement, 'background', this.tooltipBackground);
    this.renderer.setStyle(this.tooltipElement, 'color', this.tooltipColor);
    this.renderer.setStyle(this.tooltipElement, 'padding', '5px 10px');
    this.renderer.setStyle(this.tooltipElement, 'border-radius', '4px');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '1000');
    this.renderer.setStyle(this.tooltipElement, 'white-space', 'normal');

    if (this.tooltipWidth) {
      this.renderer.setStyle(this.tooltipElement, 'max-width', this.tooltipWidth);
    }
    if (this.tooltipHeight) {
      this.renderer.setStyle(this.tooltipElement, 'max-height', this.tooltipHeight);
      this.renderer.setStyle(this.tooltipElement, 'overflow', 'auto');
    }

    this.renderer.setStyle(this.tooltipElement, 'display', 'none');
    this.renderer.appendChild(document.body, this.tooltipElement);

    // Gắn listener cho tooltip
    this.renderer.listen(this.tooltipElement, 'mouseenter', () => {
      this.isHoveringTooltip = true;
      this.renderer.setStyle(this.tooltipElement, 'display', 'block');
    });
    this.renderer.listen(this.tooltipElement, 'mouseleave', () => {
      this.isHoveringTooltip = false;
      this.renderer.setStyle(this.tooltipElement, 'display', 'none');
    });
  }

  private setPosition() {
    // Delay để tooltip render xong trước khi đo
    setTimeout(() => {
      const hostPos = this.el.nativeElement.getBoundingClientRect();
      const tooltipPos = this.tooltipElement.getBoundingClientRect();

      let top = 0, left = 0;

      switch (this.tooltipPosition) {
        case 'top':
          top = hostPos.top - tooltipPos.height - 8;
          left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
          break;
        case 'bottom':
          top = hostPos.bottom + 8;
          left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
          break;
        case 'left':
          top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
          left = hostPos.left - tooltipPos.width - 8;
          break;
        case 'right':
          top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
          left = hostPos.right + 8;
          break;
      }

      this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
      this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
    });
  }
}
