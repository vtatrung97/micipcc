import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { ProcessGraphTranslateLoader, PG_DEFAULT_LANG, getInitialProcessGraphLang } from './i18n/process-graph-i18n';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GraphEditorComponent } from './graph-editor.component';
import { GraphEditorRoutingModule } from './graph-editor-routing.module';
import { SharedModule } from '@shared/shared.module';
import { NodeConfigDrawerComponent } from './node-config-drawer/node-config-drawer.component';
import { AddStepOverlayComponent } from './add-step/add-step-overlay.component';
import { ProcessInfoFormComponent } from './info-form/process-info-form.component';
import {
  TemplateInfoModalComponent,
  NotifyConfigModalComponent,
  JsonPreviewModalComponent,
  ValidationModalComponent,
  NodeIconModalComponent,
  BranchConditionModalComponent,
  ConfirmCancelModalComponent,
  ProcessPreviewModalComponent,
  CategoryAddModalComponent
} from './modals';
import { CanvasToolbarComponent } from './canvas-toolbar/canvas-toolbar.component';
import { ProcessViewerComponent } from './process-viewer/process-viewer.component';
import { InputFilterDirective } from './directives/input-filter.directive';
import {
  ActionNodeConfigComponent,
  ConditionNodeConfigComponent,
  TaskNodeConfigComponent,
  TriggerNodeConfigComponent,
  SplitNodeConfigComponent,
  MergeNodeConfigComponent,
  EndNodeConfigComponent,
  NotificationNodeConfigComponent,
  SubProcessNodeConfigComponent
} from './node-config-drawer/components';

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

@NgModule({
  declarations: [
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
    SubProcessNodeConfigComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    GraphEditorRoutingModule,
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
    })
  ],
  // forChild không tự provide TranslateStore (chỉ forRoot có) → khai báo ở đây khi app chưa dùng TranslateModule.forRoot
  providers: [TranslateStore],
  exports: [
    GraphEditorComponent
  ]
})
export class GraphEditorModule {
  constructor(translate: TranslateService) {
    translate.use(getInitialProcessGraphLang());
  }
}


