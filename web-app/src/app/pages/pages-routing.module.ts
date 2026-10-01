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
    canActivateChild: [RbacRouteGuard],
    children: [
      // ======================================================================
      // [PHÂN HỆ M1] - QUẢN LÝ QUY TRÌNH (BPMN PROCESS BUILDER & TEMPLATES)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.GRAPH.path,
        loadChildren: () => import('./features/process-graph/graph-editor.module').then(m => m.GraphEditorModule)
      },
      {
        path: SYSTEM_ROUTES.ACTION_LIBRARY.path,
        loadChildren: () => import('./features/process-action-library/action-library.module').then(m => m.ActionLibraryModule)
      },
      {
        path: SYSTEM_ROUTES.TEMPLATES_LIST.path,
        loadChildren: () => import('./features/process-templates-list/process-templates-list.module').then(m => m.ProcessTemplatesListModule)
      },

      // ======================================================================
      // [PHÂN HỆ M2] - QUẢN LÝ FLOW INSTANCE (GIÁM SÁT TIẾN TRÌNH & AUDIT TRAIL)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.INSTANCES_MONITOR.path,
        loadChildren: () => import('./features/instance-monitor/instance-monitor.module').then(m => m.InstanceMonitorModule)
      },
      {
        path: SYSTEM_ROUTES.INSTANCES_HISTORY.path,
        loadChildren: () => import('./features/instance-history/instance-history.module').then(m => m.InstanceHistoryModule)
      },
      {
        path: SYSTEM_ROUTES.INSTANCES_LOGS.path,
        loadChildren: () => import('./features/instance-logs/instance-logs.module').then(m => m.InstanceLogsModule)
      },

      // ======================================================================
      // [PHÂN HỆ M3] - QUẢN LÝ TASK (TASK MANAGEMENT & PHÊ DUYỆT)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.TASKS_MY_TASKS.path,
        loadChildren: () => import('./features/tasks-my-task/tasks-my-task.module').then(m => m.TasksMyTaskModule)
      },
      {
        path: SYSTEM_ROUTES.TASKS_PROCESS.path,
        loadChildren: () => import('./features/tasks-process/tasks-process.module').then(m => m.TasksProcessModule)
      },
      {
        path: SYSTEM_ROUTES.TASKS_REFERENCE.path,
        loadChildren: () => import('./features/tasks-reference/tasks-reference.module').then(m => m.TasksReferenceModule)
      },

      // ======================================================================
      // [PHÂN HỆ M4] - BÁO CÁO & DASHBOARD (SLA PERFORMANCE & METRICS)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.REPORTS_DASHBOARD.path,
        loadChildren: () => import('./features/reports-dashboard/reports-dashboard.module').then(m => m.ReportsDashboardModule)
      },
      {
        path: SYSTEM_ROUTES.REPORTS_SLA_PROCESS.path,
        loadChildren: () => import('./features/reports-sla-process/reports-sla-process.module').then(m => m.ReportsSlaProcessModule)
      },

      // ======================================================================
      // [PHÂN HỆ M5] - THIẾT LẬP VẬN HÀNH (OPERATION SETTINGS & SLA ESCALATION)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.SETTINGS_SLA_ESCALATION.path,
        loadChildren: () => import('./features/settings-sla-escalation/settings-sla-escalation.module').then(m => m.SettingsSlaEscalationModule)
      },
      {
        path: SYSTEM_ROUTES.SETTINGS_AUTO_ASSIGNMENT.path,
        loadChildren: () => import('./features/settings-auto-assignment/settings-auto-assignment.module').then(m => m.SettingsAutoAssignmentModule)
      },
      {
        path: SYSTEM_ROUTES.SETTINGS_INBOUND_CHANNELS.path,
        loadChildren: () => import('./features/settings-inbound-channels/settings-inbound-channels.module').then(m => m.SettingsInboundChannelsModule)
      },
      {
        path: SYSTEM_ROUTES.SETTINGS_NOTIFICATION_TEMPLATES.path,
        loadChildren: () => import('./features/settings-notification-templates/settings-notification-templates.module').then(m => m.SettingsNotificationTemplatesModule)
      },

      // ======================================================================
      // [PHÂN HỆ M6] - DỮ LIỆU DANH MỤC (MASTER DATA & TRA CỨU)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.MASTER_DATA_SUBSCRIBERS.path,
        loadChildren: () => import('./features/master-data-subscribers/master-data-subscribers.module').then(m => m.MasterDataSubscribersModule)
      },
      {
        path: SYSTEM_ROUTES.MASTER_DATA_PRODUCTS_SERVICES.path,
        loadChildren: () => import('./features/master-data-products-services/master-data-products-services.module').then(m => m.MasterDataProductsServicesModule)
      },

      // ======================================================================
      // [PHÂN HỆ M7] - QUẢN TRỊ HỆ THỐNG (SYSTEM ADMIN & RBAC SECURITY)
      // ======================================================================
      {
        path: SYSTEM_ROUTES.ADMIN_ORGANIZATION.path,
        loadChildren: () => import('./features/admin-organization/admin-organization.module').then(m => m.AdminOrganizationModule)
      },
      {
        path: SYSTEM_ROUTES.ADMIN_USERS.path,
        loadChildren: () => import('./features/admin-users/admin-users.module').then(m => m.AdminUsersModule)
      },
      {
        path: SYSTEM_ROUTES.ADMIN_ROLES_PERMISSIONS.path,
        loadChildren: () => import('./features/admin-roles-permissions/admin-roles-permissions.module').then(m => m.AdminRolesPermissionsModule)
      },

      // Điều hướng tất cả URL không tồn tại về trang Not Found (404)
      { path: '**', redirectTo: SYSTEM_ROUTES.NOT_FOUND.fullPath }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
