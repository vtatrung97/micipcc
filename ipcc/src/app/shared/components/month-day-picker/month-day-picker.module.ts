import { NgModule } from '@angular/core';
import { TooltipModule } from '../tooltip/tooltip.module';
import { CommonModule } from '@angular/common';
import { AntIconModule } from '../ant-icon/ant-icon.module';
import { MonthDayPickerComponent } from './month-day-picker.component';

@NgModule({
  declarations: [MonthDayPickerComponent],
  imports: [CommonModule, TooltipModule, AntIconModule],
  exports: [MonthDayPickerComponent]
})
export class MonthDayPickerModule {}
