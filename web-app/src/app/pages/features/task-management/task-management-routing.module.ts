import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TaskManagementComponent } from './task-management.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'my-tasks',
    pathMatch: 'full'
  },
  {
    path: 'my-tasks',
    component: TaskManagementComponent,
    data: {
      title: 'M3: Task của tôi (My Tasks)',
      resource: 'Task',
      action: 'view'
    }
  },
  {
    path: 'process',
    component: TaskManagementComponent,
    data: {
      title: 'M3: Xử lý Task (Duyệt/Reject US-21)',
      resource: 'Task',
      action: 'view'
    }
  },
  {
    path: 'reference',
    component: TaskManagementComponent,
    data: {
      title: 'M3: Master Data tham chiếu (View-only)',
      resource: 'Task',
      action: 'view'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaskManagementRoutingModule { }
