import { ChangeDetectionStrategy, Component, ElementRef } from '@angular/core';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * Bong bóng tooltip theo Figma ProcessX "Tooltip" (node 107:17046):
 * nền Neutral/900, padding 4/8, radius 4, chữ trắng 14/20, mũi tên 12x6.
 * Không dùng trực tiếp — được tạo bởi directive `[appTooltip]` và gắn vào <body>.
 */
@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipComponent {
  text: string = '';
  placement: TooltipPlacement = 'top';
  id: string = '';
  maxWidth: number = 320;

  readonly arrowIcon = 'assets/icons/processx/tooltip-arrow.svg';

  constructor(public elementRef: ElementRef<HTMLElement>) {}
}
