import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AntIconModule } from '../ant-icon/ant-icon.module';
import { DatePickerComponent } from './date-picker.component';

@NgModule({
  declarations: [DatePickerComponent],
  imports: [CommonModule, FormsModule, AntIconModule],
  exports: [DatePickerComponent]
})
export class DatePickerModule {}
