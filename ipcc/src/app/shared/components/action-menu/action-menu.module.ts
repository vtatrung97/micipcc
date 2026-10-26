import { NgModule } from '@angular/core';
import { TooltipModule } from '../tooltip/tooltip.module';
import { CommonModule } from '@angular/common';
import { ActionMenuComponent } from './action-menu.component';

@NgModule({
  declarations: [ActionMenuComponent],
  imports: [CommonModule, TooltipModule],
  exports: [ActionMenuComponent]
})
export class ActionMenuModule {}
