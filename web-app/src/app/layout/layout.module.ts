import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { TabBarComponent } from './components/tab-bar/tab-bar.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { BlankLayoutComponent } from './layouts/blank-layout/blank-layout.component';

@NgModule({
  declarations: [
    SidebarComponent,
    HeaderComponent,
    TabBarComponent,
    MainLayoutComponent,
    BlankLayoutComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    MainLayoutComponent,
    BlankLayoutComponent,
    SidebarComponent,
    HeaderComponent,
    TabBarComponent
  ]
})
export class LayoutModule { }
