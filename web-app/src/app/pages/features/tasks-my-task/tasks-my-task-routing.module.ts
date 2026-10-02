import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TasksMyTaskComponent } from './tasks-my-task.component';

const routes: Routes = [
  {
    path: '',
    component: TasksMyTaskComponent,
    data: {
      title: 'M3: Task của tôi',
      resource: 'Task',
      action: 'view'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksMyTaskRoutingModule { }
