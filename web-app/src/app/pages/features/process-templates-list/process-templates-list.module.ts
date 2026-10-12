import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { ProcessTemplatesListComponent } from './process-templates-list.component';
import { ProcessTemplatesListRoutingModule } from './process-templates-list-routing.module';
import { AdvancedFilterDrawerComponent } from './components/advanced-filter-drawer/advanced-filter-drawer.component';
import { ProcessActionModalComponent } from './components/process-action-modal/process-action-modal.component';

// ng-zorro
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMessageModule } from 'ng-zorro-antd/message';

@NgModule({
  declarations: [
    ProcessTemplatesListComponent,
    AdvancedFilterDrawerComponent,
    ProcessActionModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ProcessTemplatesListRoutingModule,
    NzButtonModule,
    NzDropDownModule,
    NzMessageModule
  ],
  exports: [
    ProcessTemplatesListComponent
  ]
})
export class ProcessTemplatesListModule { }
