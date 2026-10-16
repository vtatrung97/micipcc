import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessDiagramViewerComponent } from './process-diagram-viewer.component';

@NgModule({
  declarations: [ProcessDiagramViewerComponent],
  imports: [CommonModule],
  exports: [ProcessDiagramViewerComponent],
})
export class ProcessDiagramViewerModule {}
