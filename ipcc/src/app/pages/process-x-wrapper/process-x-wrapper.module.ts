import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ProcessXWrapperComponent } from './process-x-wrapper.component';

const routes: Routes = [
  {
    path: '',
    component: ProcessXWrapperComponent,
  },
  {
    path: '**',
    component: ProcessXWrapperComponent,
  }
];

@NgModule({
  declarations: [
    ProcessXWrapperComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Cho phép Angular Host dùng thẻ tùy biến <process-x-app>
})
export class ProcessXWrapperModule { }
