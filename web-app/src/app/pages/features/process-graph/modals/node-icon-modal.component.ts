import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NodeType } from '../models/node-type';
import { ICON_ACCEPT, NodeIconAsset, NodeIconService } from '../services/node-icon.service';

/** Modal "Chọn biểu tượng" cho một loại bước: tải tệp lên + chọn trong danh sách icon */
@Component({
  selector: 'app-node-icon-modal',
  templateUrl: './node-icon-modal.component.html',
  styleUrls: ['./node-icon-modal.component.scss'],
})
export class NodeIconModalComponent implements OnChanges {
  @Input() visible: boolean = false;
  @Input() nodeType: NodeType | null = null;
  @Output() closed = new EventEmitter<void>();

  readonly accept = ICON_ACCEPT.join(',');
  selectedId: string = '';
  isDragging: boolean = false;
  errorText: string = '';

  constructor(
    private icons: NodeIconService,
    private translate: TranslateService,
  ) {}

  ngOnChanges(): void {
    if (this.visible && this.nodeType) {
      this.selectedId = this.icons.getIconId(this.nodeType);
      this.errorText = '';
    }
  }

  get assets(): NodeIconAsset[] {
    return this.icons.assets;
  }

  /** Lưu chỉ bật khi chọn icon khác icon đang dùng */
  get canSave(): boolean {
    return !!this.nodeType && this.selectedId !== this.icons.getIconId(this.nodeType);
  }

  onFileInput(input: HTMLInputElement): void {
    this.upload(Array.from(input.files || []));
    input.value = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    this.upload(Array.from(event.dataTransfer?.files || []));
  }

  remove(asset: NodeIconAsset): void {
    this.icons.removeUpload(asset.id);
    if (this.selectedId === asset.id && this.nodeType) {
      this.selectedId = this.icons.getIconId(this.nodeType);
    }
  }

  save(): void {
    if (!this.canSave || !this.nodeType) return;
    this.icons.setIcon(this.nodeType, this.selectedId);
    this.closed.emit();
  }

  trackById(_: number, asset: NodeIconAsset): string {
    return asset.id;
  }

  /** Tải xong: hiện trong danh sách và chọn sẵn tệp cuối cùng */
  private async upload(files: File[]): Promise<void> {
    if (!files.length) return;
    const { added, rejected } = await this.icons.addFiles(files);
    if (added.length) this.selectedId = added[added.length - 1].id;
    this.errorText = rejected.length
      ? this.translate.instant('PROCESS_GRAPH.ICON_MODAL.REJECTED', { names: rejected.join(', ') })
      : '';
  }
}
