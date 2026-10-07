import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntIconModule } from '../ant-icon/ant-icon.module';
import { MonthDayPickerComponent } from './month-day-picker.component';

@NgModule({
  declarations: [MonthDayPickerComponent],
  imports: [CommonModule, AntIconModule],
  exports: [MonthDayPickerComponent]
})
export class MonthDayPickerModule {}
