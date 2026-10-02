import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from '@layout/layouts/main-layout/main-layout.component';
import { BlankLayoutComponent } from '@layout/layouts/blank-layout/blank-layout.component';
import { ForbiddenComponent } from '@pages/system/forbidden/forbidden.component';
import { DefaultLandingGuard } from '@core/rbac';
import { AuthGuard } from '@core/auth';

const routes: Routes = [
  // 1. Phân luồng MainLayout (Ứng dụng chính)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [DefaultLandingGuard],
        children: []
      },
      {
        path: 'pages',
        loadChildren: () => import('@pages/pages.module').then(m => m.PagesModule)
      },
      // Direct alias paths for convenience
      {
        path: '',
        loadChildren: () => import('@pages/pages.module').then(m => m.PagesModule)
      }
    ]
  },

  // 2. Phân luồng BlankLayout (Màn hình 403 Forbidden, Login, Fullscreen Canvas)
  {
    path: '',
    component: BlankLayoutComponent,
    children: [
      {
        path: 'forbidden',
        component: ForbiddenComponent
      },
      {
        path: 'not-found',
        loadChildren: () => import('@pages/system/not-found/not-found.module').then(m => m.NotFoundModule)
      }
    ]
  },

  // Fallback cho URL sai ở cấp root
  {
    path: '**',
    redirectTo: '/not-found'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
