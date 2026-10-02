import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { ActionLibraryComponent } from './action-library.component';
import { ActionLibraryRoutingModule } from './action-library-routing.module';

@NgModule({
  declarations: [
    ActionLibraryComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ActionLibraryRoutingModule
  ],
  exports: [
    ActionLibraryComponent
  ]
})
export class ActionLibraryModule { }
