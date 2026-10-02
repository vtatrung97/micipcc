import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AntIconModule } from '../ant-icon/ant-icon.module';
import { AntCheckboxComponent } from './ant-checkbox.component';

@NgModule({
  declarations: [AntCheckboxComponent],
  imports: [CommonModule, FormsModule, AntIconModule],
  exports: [AntCheckboxComponent]
})
export class AntCheckboxModule {}
