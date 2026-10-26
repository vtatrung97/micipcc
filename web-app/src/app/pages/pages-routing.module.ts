import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// @ts-ignore
const routes: Routes = [
    {
        path: 'procedure-management',
        loadChildren: () => import('./features/procedure-management/procedure-management.module').then(m => m.ProcedureManagementModule)
    },
    {
        path: 'process-management',
        loadChildren: () => import('./features/process-management/process-management.module').then(m => m.ProcessManagementModule)
    },

    { path: '', redirectTo: 'procedure-management', pathMatch: 'full' },
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PagesRoutingModule {
}
