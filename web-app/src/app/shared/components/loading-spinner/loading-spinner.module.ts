import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntIconModule } from '../ant-icon/ant-icon.module';
import { LoadingSpinnerComponent } from './loading-spinner.component';

@NgModule({
  declarations: [LoadingSpinnerComponent],
  imports: [CommonModule, AntIconModule],
  exports: [LoadingSpinnerComponent]
})
export class LoadingSpinnerModule {}
