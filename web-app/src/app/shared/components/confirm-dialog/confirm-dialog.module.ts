import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntIconModule } from '../ant-icon/ant-icon.module';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@NgModule({
  declarations: [ConfirmDialogComponent],
  imports: [CommonModule, AntIconModule],
  exports: [ConfirmDialogComponent]
})
export class ConfirmDialogModule {}
