import { Directive, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Directive({
  selector: '[tooltip-html]'
})
export class TooltipHtmlDirective implements AfterViewInit, OnDestroy{

  private tooltip: NgbTooltip | undefined;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const content = this.el.nativeElement.innerHTML;
    this.tooltip = new NgbTooltip(this.el, null!, null!, null!, null!, null!, null!, null!, null!);
    this.tooltip.ngbTooltip = content;
    this.tooltip.container = 'body';
    this.tooltip.triggers = 'hover';
    this.tooltip.disableTooltip = false;
    this.tooltip.open();
  }

  ngOnDestroy() {
    if (this.tooltip) {
      this.tooltip.close();
    }
  }

}
