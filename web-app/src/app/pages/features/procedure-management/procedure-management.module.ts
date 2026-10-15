import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ProcessGraphTranslateLoader, PG_DEFAULT_LANG, getInitialProcessGraphLang } from './procedure-graph-editor/i18n/process-graph-i18n';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProcedureManagementComponent } from './procedure-management.component';
import { ProcedureManagementRoutingModule } from './procedure-management-routing.module';
import { RouterModule } from '@angular/router';

import { SharedModule } from '@shared/shared.module';

// component graph
import { NodeConfigDrawerComponent } from './procedure-graph-editor/node-config-drawer/node-config-drawer.component';
import { AddStepOverlayComponent } from './procedure-graph-editor/add-step/add-step-overlay.component';
import { ProcessInfoFormComponent } from './procedure-graph-editor/info-form/process-info-form.component';

// component graph modal
import { GraphEditorComponent } from './procedure-graph-editor/graph-editor.component';
import { TemplateInfoModalComponent } from './procedure-graph-editor/modals/template-info-modal.component';
import { NotifyConfigModalComponent } from './procedure-graph-editor/modals/notify-config-modal.component';
import { JsonPreviewModalComponent } from './procedure-graph-editor/modals/json-preview-modal.component';
import { ValidationModalComponent } from './procedure-graph-editor/modals/validation-modal.component';
import { NodeIconModalComponent } from './procedure-graph-editor/modals/node-icon-modal.component';
import { BranchConditionModalComponent } from './procedure-graph-editor/modals/branch-condition-modal.component';
import { ConfirmCancelModalComponent } from './procedure-graph-editor/modals/confirm-cancel-modal.component';
import { ProcessPreviewModalComponent } from './procedure-graph-editor/modals/process-preview-modal.component';
import { CategoryAddModalComponent } from './procedure-graph-editor/modals/category-add-modal.component';

import { CanvasToolbarComponent } from './procedure-graph-editor/canvas-toolbar/canvas-toolbar.component';
import { ProcessViewerComponent } from './procedure-graph-editor/process-viewer/process-viewer.component';
import { InputFilterDirective } from './procedure-graph-editor/directives/input-filter.directive';

// component graph node config
import { ActionNodeConfigComponent } from './procedure-graph-editor/node-config-drawer/components/action-node-config/action-node-config.component';
import { ConditionNodeConfigComponent } from './procedure-graph-editor/node-config-drawer/components/condition-node-config/condition-node-config.component';
import { TaskNodeConfigComponent } from './procedure-graph-editor/node-config-drawer/components/task-node-config/task-node-config.component';
import { TriggerNodeConfigComponent } from './procedure-graph-editor/node-config-drawer/components/trigger-node-config/trigger-node-config.component';
import { SplitNodeConfigComponent } from './procedure-graph-editor/node-config-drawer/components/split-node-config/split-node-config.component';
import { MergeNodeConfigComponent } from './procedure-graph-editor/node-config-drawer/components/merge-node-config/merge-node-config.component';
import { EndNodeConfigComponent } from './procedure-graph-editor/node-config-drawer/components/end-node-config/end-node-config.component';
import { NotificationNodeConfigComponent } from './procedure-graph-editor/node-config-drawer/components/notification-node-config/notification-node-config.component';
import { SubProcessNodeConfigComponent } from './procedure-graph-editor/node-config-drawer/components/sub-process-node-config/sub-process-node-config.component';

// component templates
import {ProcessTemplatesListComponent} from './procedure-templates-list/process-templates-list.component';
import {AdvancedFilterDrawerComponent} from './procedure-templates-list/components/advanced-filter-drawer/advanced-filter-drawer.component';
import {ProcessActionModalComponent} from './procedure-templates-list/components/process-action-modal/process-action-modal.component';
import {ProcessCloneModalComponent} from './procedure-templates-list/components/process-clone-modal/process-clone-modal.component';

// NG-ZORRO Modules
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageModule } from 'ng-zorro-antd/message';

const Components = [
  ProcedureManagementComponent,

  GraphEditorComponent,
  NodeConfigDrawerComponent,
  AddStepOverlayComponent,
  ProcessInfoFormComponent,
  TemplateInfoModalComponent,
  NotifyConfigModalComponent,
  JsonPreviewModalComponent,
  ValidationModalComponent,
  NodeIconModalComponent,
  BranchConditionModalComponent,
  ConfirmCancelModalComponent,
  ProcessPreviewModalComponent,
  CategoryAddModalComponent,
  CanvasToolbarComponent,
  ProcessViewerComponent,
  InputFilterDirective,
  ActionNodeConfigComponent,
  ConditionNodeConfigComponent,
  TaskNodeConfigComponent,
  TriggerNodeConfigComponent,
  SplitNodeConfigComponent,
  MergeNodeConfigComponent,
  EndNodeConfigComponent,
  NotificationNodeConfigComponent,
  SubProcessNodeConfigComponent,
  ConfirmCancelModalComponent,
  ConfirmCancelModalComponent,

  AdvancedFilterDrawerComponent,
  ProcessActionModalComponent,
  ProcessCloneModalComponent,

  ProcessTemplatesListComponent,
  AdvancedFilterDrawerComponent,
  ProcessActionModalComponent,
  ProcessCloneModalComponent
]


@NgModule({
  declarations: [
    ...Components
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    NzDrawerModule,
    NzModalModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzSwitchModule,
    NzButtonModule,
    NzBadgeModule,
    NzToolTipModule,
    NzCheckboxModule,
    NzDropDownModule,
    NzMenuModule,
    NzMessageModule,
    // i18n riêng cho Canvas Builder: bản dịch nằm ở ./i18n (vi, en)
    TranslateModule.forChild({
      loader: { provide: TranslateLoader, useClass: ProcessGraphTranslateLoader },
      defaultLanguage: PG_DEFAULT_LANG,
      isolate: true
    }),
    RouterModule,
    ProcedureManagementRoutingModule
  ],
  // forChild không tự provide TranslateStore (chỉ forRoot có) → khai báo ở đây khi app chưa dùng TranslateModule.forRoot
  providers: [TranslateStore],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProcedureManagementModule {
  constructor(translate: TranslateService) {
    translate.use(getInitialProcessGraphLang());
  }
}


