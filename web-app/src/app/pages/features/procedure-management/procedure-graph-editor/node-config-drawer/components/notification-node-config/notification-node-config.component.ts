import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectOption } from '@shared/components/ant-select/ant-select.component';
import { NodePropertyModel } from '../../../models/node-property.model';
import { NodeFieldErrors } from '../../../models/node-validation';
import { NODE_TEXT_LIMITS, applyLabelChange, nodeKeyFilter } from '../../../models/node-key';
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_LIMITS,
  NOTIFICATION_SOURCES,
  NOTIFICATION_USER_OPTIONS,
} from '../../../config/notification.config';
import { GraphBridgeService } from '../../../services/graph-bridge.service';
import { ProcessVariableService } from '../../../services/process-variable.service';

type SectionKey = 'general' | 'notification';

/** Nội dung drawer node Thông báo: kênh, nguồn nhận, người nhận, tiêu đề, nội dung */
@Component({
  selector: 'app-notification-node-config',
  templateUrl: './notification-node-config.component.html',
  styleUrls: ['./notification-node-config.component.scss'],
})
export class NotificationNodeConfigComponent implements OnChanges {
  @Input() nodeProps!: NodePropertyModel;
  /** Lỗi trường bắt buộc do drawer kiểm tra khi bấm Lưu */
  @Input() errors: NodeFieldErrors = {};

  readonly limits = NODE_TEXT_LIMITS;
  readonly notifyLimits = NOTIFICATION_LIMITS;
  readonly nodeKeyFilter = nodeKeyFilter;
  readonly userOptions = NOTIFICATION_USER_OPTIONS;

  openSections: Record<SectionKey, boolean> = { general: true, notification: true };
  channelOptions: SelectOption[] = [];
  sourceOptions: SelectOption[] = [];
  /** Biến quy trình của các bước đứng trước (nguồn nhận = Biến quy trình) */
  variableOptions: SelectOption[] = [];

  constructor(
    private bridgeService: GraphBridgeService,
    private variables: ProcessVariableService,
    private translate: TranslateService,
  ) {
    const t = (key: string) => this.translate.instant('PROCESS_GRAPH.DRAWER.NOTIFICATION.' + key);
    this.channelOptions = NOTIFICATION_CHANNELS.map((v) => ({ value: v, label: t('CHANNELS.' + v) }));
    this.sourceOptions = NOTIFICATION_SOURCES.map((v) => ({ value: v, label: t('SOURCES.' + v) }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['nodeProps'] || !this.nodeProps) return;
    this.variableOptions = this.variables
      .getVariables(this.nodeProps.id)
      .map((v) => ({ value: v.value, label: v.displayName ? v.value + ' - ' + v.displayName : v.value }));
    // Dữ liệu cũ (kênh / người nhận ngoài danh sách mới) → bỏ để chọn lại
    let changed = false;
    if (this.nodeProps.notificationChannel && !NOTIFICATION_CHANNELS.includes(this.nodeProps.notificationChannel)) {
      this.nodeProps.notificationChannel = undefined;
      changed = true;
    }
    if (!this.nodeProps.notificationSource && this.nodeProps.notificationRecipient) {
      this.nodeProps.notificationRecipient = undefined;
      changed = true;
    }
    if (changed) this.save('all');
  }

  get isVariableSource(): boolean {
    return this.nodeProps.notificationSource === 'VARIABLE';
  }

  get isUserSource(): boolean {
    return this.nodeProps.notificationSource === 'USER';
  }

  isOpen(key: SectionKey): boolean {
    return this.openSections[key];
  }

  toggleSection(key: SectionKey): void {
    this.openSections[key] = !this.openSections[key];
  }

  /** Đổi tên bước; mã bước còn tự sinh thì sinh lại theo tên mới */
  onLabelChange(label: string): void {
    applyLabelChange(this.nodeProps, label);
    this.bridgeService.updateNodeLabel(this.nodeProps.id, this.nodeProps.label, this.nodeProps);
  }

  /** Đổi nguồn nhận → bỏ người nhận đã chọn của nguồn cũ */
  onSourceChange(): void {
    this.nodeProps.notificationRecipient = undefined;
    this.nodeProps.notificationRecipients = [];
    this.save('all');
  }

  save(field: keyof NodePropertyModel | 'all'): void {
    const value = field === 'all' ? this.nodeProps : this.nodeProps[field];
    this.bridgeService.updateNodeProp(this.nodeProps.id, field, value, this.nodeProps);
  }

  /** Câu lỗi bỏ trống của một trường (rỗng nếu hợp lệ) */
  error(field: keyof NodePropertyModel): string {
    return this.errors[field] ? this.translate.instant('PROCESS_GRAPH.DRAWER.VALIDATION.REQUIRED') : '';
  }
}
