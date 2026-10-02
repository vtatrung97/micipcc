import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GraphEditorComponent } from './graph-editor.component';

const routes: Routes = [
  { path: '', component: GraphEditorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GraphEditorRoutingModule { }
