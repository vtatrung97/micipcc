import { Component, Input } from '@angular/core';
import { TooltipPlacement } from './tooltip.component';

/**
 * Icon "?" tròn 16px (Figma ProcessX "tooltip circle" 316:69663) — hover/focus hiện tooltip.
 * Dùng cạnh label: <span>Luồng mặc định</span> <app-help-tooltip text="Các trường hợp còn lại…"></app-help-tooltip>
 */
@Component({
  selector: 'app-help-tooltip',
  templateUrl: './help-tooltip.component.html',
  styleUrls: ['./help-tooltip.component.scss']
})
export class HelpTooltipComponent {
  @Input() text: string = '';
  @Input() placement: TooltipPlacement = 'top';
  @Input() maxWidth: number = 320;
}
