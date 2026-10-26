import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProcedureManagementComponent } from './procedure-management.component';
import { ProcessTemplatesListComponent } from './procedure-templates-list/process-templates-list.component';
import { GraphEditorComponent } from './procedure-graph-editor/graph-editor.component';

const routes: Routes = [
  {
    path: '',
    component: ProcessTemplatesListComponent,
  },
  { path: 'graph', component: GraphEditorComponent },
  { path: 'graph/:id', component: GraphEditorComponent }
];
console.log('aaa', routes);

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcedureManagementRoutingModule { }
