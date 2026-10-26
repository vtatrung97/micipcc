import { NgModule } from '@angular/core';
import { RouteReuseStrategy, RouterModule, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/module-federation';

import { LayoutComponent } from './layouts/layout.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { CustomReuseStrategy } from './route-reuse';

/**
 * Lấy URL của Remote App (web-app/processX):
 * 1. Ưu tiên lấy từ window.env (khi deploy môi trường Test/Production)
 * 2. Fallback về localhost:4201 khi chạy Dev local
 */
export function getProcessXRemoteUrl(): string {
  const envUrl = (window as any).env?.SERVICES?.PROCESSX_URL;
  console.log('envUrl', envUrl);
  if (envUrl) {
    console.log(`${envUrl.replace(/\/+$/, '')}/remoteEntry.js`);

    return `${envUrl.replace(/\/+$/, '')}/remoteEntry.js`;
  }
  console.log('envUrl', envUrl);
  return 'http://localhost:4201/remoteEntry.js';
}

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // 1. Trang chủ mặc định của Host Shell: Ticket Dashboard
      {
        path: '',
        redirectTo: 'ticket',
        pathMatch: 'full'
      },
      {
        path: 'ticket',
        loadChildren: () => import('./pages/ticket/ticket.module').then(m => m.TicketModule),
        canActivate: [AuthGuard]
      },

      // ========================================================================
      // 2. IPCC (HOST SHELL) NẠP WEB-APP (REMOTE APP) QUA MODULE FEDERATION
      // ========================================================================
      {
        path: 'processX',
        loadChildren: () => import('./pages/process-x-wrapper/process-x-wrapper.module').then(m => m.ProcessXWrapperModule)
      },

      // Hỗ trợ alias URL khi menu hoặc link gọi trực tiếp không có prefix /processX
      // {
      //   path: 'procedure-management',
      //   loadChildren: () => loadRemoteModule({
      //     type: 'module',
      //     remoteEntry: getProcessXRemoteUrl(),
      //     exposedModule: './ProcessXModule'
      //   }).then(m => m.ProcessXModule),
      //   canActivate: [AuthGuard]
      // },
      // {
      //   path: 'process-management',
      //   loadChildren: () => loadRemoteModule({
      //     type: 'module',
      //     remoteEntry: getProcessXRemoteUrl(),
      //     exposedModule: './ProcessXModule'
      //   }).then(m => m.ProcessXModule),
      //   canActivate: [AuthGuard]
      // },

      // 3. Các phân hệ của Host Shell IPCC (bao gồm procedure-management & process-management)
      {
        path: '',
        loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
        canActivate: [AuthGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'ticket'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
  ]
})
export class AppRoutingModule { }
