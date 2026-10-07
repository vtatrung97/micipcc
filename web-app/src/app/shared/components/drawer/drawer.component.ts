import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

/**
 * Khung drawer bên phải theo Figma ProcessX "Drawer content":
 * header (_Header modal) · body cuộn · footer (_Modal Actions, chiếu qua [drawer-footer]).
 */
@Component({
  selector: 'app-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss']
})
export class DrawerComponent {
  @Input() visible: boolean = false;
  @Input() title: string = '';
  @Input() width: number = 500;
  /** Bấm nền tối để đóng */
  @Input() maskClosable: boolean = true;

  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  onMaskClick(): void {
    if (this.maskClosable) this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.visible) this.close();
  }
}
