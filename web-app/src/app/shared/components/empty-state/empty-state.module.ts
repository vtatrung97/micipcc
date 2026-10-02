import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AntIconModule } from '../ant-icon/ant-icon.module';
import { EmptyStateComponent } from './empty-state.component';

@NgModule({
  declarations: [EmptyStateComponent],
  imports: [CommonModule, AntIconModule],
  exports: [EmptyStateComponent]
})
export class EmptyStateModule {}
