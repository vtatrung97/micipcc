import { Component, Input } from '@angular/core';
import { NodePropertyModel } from '../../../graph-editor.component';
import { GraphBridgeService } from '../../../services/graph-bridge.service';

@Component({
  selector: 'app-notification-node-config',
  templateUrl: './notification-node-config.component.html',
  styleUrls: ['./notification-node-config.component.scss']
})
export class NotificationNodeConfigComponent {
  @Input() nodeProps!: NodePropertyModel;

  channelOptions = [
    { value: 'SMS', label: 'Tin nhắn SMS Brandname' },
    { value: 'EMAIL', label: 'Thư điện tử (Email)' },
    { value: 'APP_NOTIFICATION', label: 'Thông báo trên ứng dụng (In-App OTT)' },
    { value: 'WEBHOOK', label: 'Gửi Webhook sự kiện' }
  ];

  recipientOptions = [
    { value: 'CUSTOMER', label: 'Khách hàng (Chủ thuê bao)' },
    { value: 'ASSIGNEE', label: 'Điện thoại viên đang xử lý' },
    { value: 'SUPERVISOR', label: 'Trưởng ca / Giám sát' },
    { value: 'DEPARTMENT', label: 'Toàn bộ đơn vị chuyên môn' }
  ];

  constructor(private bridgeService: GraphBridgeService) {}

  public onPropChange(field?: keyof NodePropertyModel | 'all'): void {
    if (!this.nodeProps) return;
    const value = field && field !== 'all' ? this.nodeProps[field] : this.nodeProps;
    this.bridgeService.updateNodeProp(this.nodeProps.id, field || 'all', value, this.nodeProps);
  }

  public insertVariable(variableName: string): void {
    if (!this.nodeProps) return;
    const currentMsg = this.nodeProps.notificationContent || '';
    this.nodeProps.notificationContent = currentMsg + ` {${variableName}}`;
    this.onPropChange('notificationContent');
  }
}
