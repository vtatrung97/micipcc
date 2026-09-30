import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RbacRouteGuard, SYSTEM_ROUTES } from '@core/rbac';
import { PagesComponent } from './pages.component';

/**
 * ============================================================================
 * MA TRẬN ROUTING TOÀN BỘ PHÂN HỆ DOANH NGHIỆP (ENTERPRISE RBAC ROUTING)
 * ============================================================================
 * - Thẩm quyền RBAC (Resource, Action) và Breadcrumbs được quản lý tập trung
 *   tại `menu.config.ts`, không cần hardcode trong `data` của router.
 * - Route Guard (RbacRouteGuard) tự động đối chiếu URL hiện tại với in-memory RAM cache.
 * ============================================================================
 */
const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivateChild: [RbacRouteGuard], // Điểm chặn tập trung cho tất cả các route con
    children: [
      // ======================================================================
      // [PHÂN HỆ M1] - QUẢN LÝ QUY TRÌNH (BPMN PROCESS BUILDER & TEMPLATES)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.GRAPH.path,
        loadChildren: () => import('./features/graph-editor/graph-editor.module').then(m => m.GraphEditorModule)
      },
      {
        path: SYSTEM_ROUTES.ACTION_LIBRARY.path,
        loadChildren: () => import('./features/action-library/action-library.module').then(m => m.ActionLibraryModule)
      },
      {
        path: SYSTEM_ROUTES.TEMPLATES_MANAGEMENT.path,
        loadChildren: () => import('./features/templates-management/templates-management.module').then(m => m.TemplatesManagementModule)
      },

      // ======================================================================
      // [PHÂN HỆ M2] - QUẢN LÝ FLOW INSTANCE (GIÁM SÁT TIẾN TRÌNH & AUDIT TRAIL)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.INSTANCES.path,
        loadChildren: () => import('./features/flow-instances/flow-instances.module').then(m => m.FlowInstancesModule)
      },
      {
        path: SYSTEM_ROUTES.FLOW_INSTANCES.path,
        loadChildren: () => import('./features/flow-instances/flow-instances.module').then(m => m.FlowInstancesModule)
      },

      // ======================================================================
      // [PHÂN HỆ M3] - QUẢN LÝ TASK (TASK MANAGEMENT & PHÊ DUYỆT)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.TASKS.path,
        loadChildren: () => import('./features/task-management/task-management.module').then(m => m.TaskManagementModule)
      },

      // ======================================================================
      // [PHÂN HỆ M4] - BÁO CÁO & DASHBOARD (SLA PERFORMANCE & METRICS)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.REPORTS.path,
        loadChildren: () => import('./features/reports-dashboard/reports-dashboard.module').then(m => m.ReportsDashboardModule)
      },

      // ======================================================================
      // [PHÂN HỆ M5] - THIẾT LẬP VẬN HÀNH (OPERATION SETTINGS & SLA ESCALATION)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.SETTINGS.path,
        loadChildren: () => import('./features/operation-settings/operation-settings.module').then(m => m.OperationSettingsModule)
      },

      // ======================================================================
      // [PHÂN HỆ M6] - DỮ LIỆU DANH MỤC (MASTER DATA & TRA CỨU)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.MASTER_DATA.path,
        loadChildren: () => import('./features/master-data/master-data.module').then(m => m.MasterDataModule)
      },

      // ======================================================================
      // [PHÂN HỆ M7] - QUẢN TRỊ HỆ THỐNG (SYSTEM ADMIN & RBAC SECURITY)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.ADMIN.path,
        loadChildren: () => import('./features/system-admin/system-admin.module').then(m => m.SystemAdminModule)
      },
      {
        path: SYSTEM_ROUTES.SYSTEM_ADMIN.path,
        loadChildren: () => import('./features/system-admin/system-admin.module').then(m => m.SystemAdminModule)
      },

      // Điều hướng tất cả URL sai / không tồn tại về trang 403 Forbidden
      { path: '**', redirectTo: SYSTEM_ROUTES.FORBIDDEN.fullPath }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
