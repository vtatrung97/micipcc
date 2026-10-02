import { Component, Optional } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-notify-config-modal',
  templateUrl: './notify-config-modal.component.html',
  styleUrls: ['./notify-config-modal.component.scss']
})
export class NotifyConfigModalComponent {
  webNotify: boolean = true;
  smsNotify: boolean = true;
  emailNotify: boolean = false;

  constructor(@Optional() private modalRef: NzModalRef) {}

  getConfig(): any {
    return {
      webNotify: this.webNotify,
      smsNotify: this.smsNotify,
      emailNotify: this.emailNotify
    };
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close(this.getConfig());
    }
  }
}
