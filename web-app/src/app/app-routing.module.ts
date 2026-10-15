import {NgModule} from '@angular/core';
import {RouteReuseStrategy, RouterModule, Routes} from '@angular/router';

import {LayoutComponent} from './layouts/layout.component';

// Auth
import {AuthGuard} from '@core/guards/auth.guard';
import {CustomReuseStrategy} from "./route-reuse";


const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
          {
            path: '',
            loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule),
            canActivate: [AuthGuard]
          }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [
        { provide: RouteReuseStrategy, useClass: CustomReuseStrategy },
    ]
})
export class AppRoutingModule {
}
