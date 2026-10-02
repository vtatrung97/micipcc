import { NgModule, Optional, SkipSelf, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';
import { JwtInterceptor } from './http/interceptors/jwt.interceptor';
import { ErrorInterceptor } from './http/interceptors/error.interceptor';
import { HasPermissionDirective } from './rbac/directives/has-permission.directive';
import { AuthService } from './auth/auth.service';

export function initializeAuth(authService: AuthService) {
  return () => authService.initAuth();
}

@NgModule({
  declarations: [
    HasPermissionDirective
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    OAuthModule.forRoot()
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    },
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  exports: [
    HasPermissionDirective,
    OAuthModule
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import CoreModule only in AppModule.');
    }
  }
}
