import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './http/interceptors/jwt.interceptor';
import { ErrorInterceptor } from './http/interceptors/error.interceptor';
import { HasPermissionDirective } from './rbac/directives/has-permission.directive';

@NgModule({
  declarations: [
    HasPermissionDirective
  ],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  exports: [
    HasPermissionDirective
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import CoreModule only in AppModule.');
    }
  }
}
