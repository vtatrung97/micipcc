import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Toolbar nổi góc dưới trái canvas: Hoàn tác · Làm lại | Thu nhỏ · % · Phóng to | Vừa màn hình · Sắp xếp lại.
 * Dùng chung cho màn thiết kế và popup xem quy trình.
 */
@Component({
  selector: 'app-canvas-toolbar',
  templateUrl: './canvas-toolbar.component.html',
  styleUrls: ['./canvas-toolbar.component.scss'],
})
export class CanvasToolbarComponent {
  @Input() canUndo: boolean = false;
  @Input() canRedo: boolean = false;
  /** Mức thu phóng hiện tại (%) */
  @Input() zoom: number = 100;

  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() zoomIn = new EventEmitter<void>();
  @Output() zoomOut = new EventEmitter<void>();
  @Output() resetZoom = new EventEmitter<void>();
  @Output() fit = new EventEmitter<void>();
  @Output() autoLayout = new EventEmitter<void>();
}
