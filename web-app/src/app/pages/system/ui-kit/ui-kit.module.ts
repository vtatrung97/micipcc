import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@shared/shared.module';
import { UiKitComponent } from './ui-kit.component';
import { UiKitRoutingModule } from './ui-kit-routing.module';

/**
 * UiKitModule: Trang showcase (dev) liệt kê toàn bộ component trong `shared/`
 * kèm các trạng thái để kiểm tra UI hiện tại. Không gắn RBAC, không gọi API.
 */
@NgModule({
  declarations: [
    UiKitComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    UiKitRoutingModule
  ]
})
export class UiKitModule { }
