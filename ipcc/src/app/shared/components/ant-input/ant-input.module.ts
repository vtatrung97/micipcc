import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AntIconModule } from '../ant-icon/ant-icon.module';
import { AntInputComponent } from './ant-input.component';

@NgModule({
  declarations: [AntInputComponent],
  imports: [CommonModule, FormsModule, AntIconModule],
  exports: [AntInputComponent]
})
export class AntInputModule {}
