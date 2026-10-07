import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuickFilterComponent } from './quick-filter.component';

@NgModule({
  declarations: [QuickFilterComponent],
  imports: [CommonModule],
  exports: [QuickFilterComponent]
})
export class QuickFilterModule {}
