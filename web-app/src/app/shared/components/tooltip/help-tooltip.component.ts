import { Component, Input } from '@angular/core';
import { TooltipPlacement } from './tooltip.component';

/** Icon "?" tròn 16px đặt cạnh label, hover/focus hiện tooltip `text` */
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
