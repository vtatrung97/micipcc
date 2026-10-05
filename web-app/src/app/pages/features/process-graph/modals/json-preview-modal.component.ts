import { Component, Input, OnInit, Optional } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-json-preview-modal',
  templateUrl: './json-preview-modal.component.html',
  styleUrls: ['./json-preview-modal.component.scss']
})
export class JsonPreviewModalComponent implements OnInit {
  @Input() jsonPayload: string | null = '';

  public activeView: 'full' | 'execution' | 'graph' = 'full';
  public parsedData: any = null;

  constructor(@Optional() private modalRef: NzModalRef) {}

  ngOnInit(): void {
    try {
      if (this.jsonPayload) {
        this.parsedData = typeof this.jsonPayload === 'string' ? JSON.parse(this.jsonPayload) : this.jsonPayload;
      }
    } catch {
      this.parsedData = null;
    }
  }

  get currentDisplayJson(): string {
    if (!this.parsedData) {
      return typeof this.jsonPayload === 'string' ? this.jsonPayload : JSON.stringify(this.jsonPayload, null, 2);
    }

    if (this.activeView === 'execution') {
      return JSON.stringify(this.parsedData.executionGraph || this.parsedData, null, 2);
    } else if (this.activeView === 'graph') {
      return JSON.stringify(this.parsedData.graphData || this.parsedData, null, 2);
    }
    return JSON.stringify(this.parsedData, null, 2);
  }

  setView(view: 'full' | 'execution' | 'graph'): void {
    this.activeView = view;
  }

  copyJson(): void {
    const textToCopy = this.currentDisplayJson;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Đã sao chép dữ liệu JSON Map vào Clipboard!');
      });
    }
  }

  downloadJson(): void {
    const textToDownload = this.currentDisplayJson;
    if (!textToDownload) return;

    const templateCode = this.parsedData?.template?.code || 'WORKFLOW_MAP';
    const filename = `${templateCode}_${this.activeView}_${Date.now()}.json`;

    const blob = new Blob([textToDownload], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
    }
  }
}
