import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipComponent } from './tooltip.component';
import { TooltipDirective } from './tooltip.directive';
import { HelpTooltipComponent } from './help-tooltip.component';

@NgModule({
  declarations: [TooltipComponent, TooltipDirective, HelpTooltipComponent],
  imports: [CommonModule],
  exports: [TooltipDirective, HelpTooltipComponent]
})
export class TooltipModule {}
