import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '@shared/shared.module';

import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';

import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopBarComponent } from './topbar/topbar.component';
import { FooterComponent } from './footer/footer.component';
import { ServiceOwnerSelectComponent } from './topbar/components/service-owner-select/service-owner-select.component';
import { UserProfileMenuComponent } from './topbar/components/user-profile-menu/user-profile-menu.component';

@NgModule({
  declarations: [
    LayoutComponent,
    SidebarComponent,
    TopBarComponent,
    FooterComponent,
    ServiceOwnerSelectComponent,
    UserProfileMenuComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule,
    SharedModule,
    NzDropDownModule,
    NzMenuModule
  ],
  exports: [
    LayoutComponent,
    SidebarComponent,
    TopBarComponent,
    FooterComponent,
    ServiceOwnerSelectComponent,
    UserProfileMenuComponent,
    TranslateModule
  ]
})
export class LayoutsModule { }
