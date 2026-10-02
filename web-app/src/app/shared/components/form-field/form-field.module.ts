import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntIconModule } from '../ant-icon/ant-icon.module';
import { FormFieldComponent } from './form-field.component';

@NgModule({
  declarations: [FormFieldComponent],
  imports: [CommonModule, AntIconModule],
  exports: [FormFieldComponent]
})
export class FormFieldModule {}
