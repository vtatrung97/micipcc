import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraphEditorComponent } from './graph-editor.component';
import { GraphEditorRoutingModule } from './graph-editor-routing.module';
import { SharedModule } from '@shared/shared.module';

@NgModule({
  declarations: [
    GraphEditorComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    GraphEditorRoutingModule
  ],
  exports: [
    GraphEditorComponent
  ]
})
export class GraphEditorModule { }
