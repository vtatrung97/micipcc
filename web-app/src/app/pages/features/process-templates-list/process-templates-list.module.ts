import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { ProcessTemplatesListComponent } from './process-templates-list.component';
import { ProcessTemplatesListRoutingModule } from './process-templates-list-routing.module';

@NgModule({
  declarations: [
    ProcessTemplatesListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ProcessTemplatesListRoutingModule
  ],
  exports: [
    ProcessTemplatesListComponent
  ]
})
export class ProcessTemplatesListModule { }
