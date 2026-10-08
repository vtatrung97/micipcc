import { NgModule } from '@angular/core';
import { TooltipModule } from '../tooltip/tooltip.module';
import { CommonModule } from '@angular/common';
import { MultiSelectComponent } from './multi-select.component';

@NgModule({
  declarations: [MultiSelectComponent],
  imports: [CommonModule, TooltipModule],
  exports: [MultiSelectComponent]
})
export class MultiSelectModule {}
