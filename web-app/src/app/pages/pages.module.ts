import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { PagesRoutingModule } from './pages-routing.module';
import { PagesComponent } from './pages.component';

/**
 * PagesModule: Module cổng (Gateway Module) đóng vai trò khung hiển thị chính.
 * Toàn bộ các Feature Modules con (M1 - M7) được tải theo cơ chế Lazy Loading
 * qua PagesRoutingModule, giúp chia nhỏ bundle và tăng tốc tải trang ban đầu.
 */
@NgModule({
  declarations: [
    PagesComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PagesRoutingModule
  ],
  exports: [
    PagesComponent
  ]
})
export class PagesModule { }
