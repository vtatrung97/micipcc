import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';


/**
 * Màn Canvas Builder: chỉ điều phối sự kiện từ template / drawer / router sang service.
 * State dùng chung nằm ở GraphEditorStore; cấu trúc chi tiết xem README.md.
 */
@Component({
  selector: 'app-procedure-management',
  templateUrl: './procedure-management.component.html',
  styleUrls: ['./procedure-management.component.scss'],
  // Mỗi lần mở màn hình có 1 bộ state + service riêng

})
export class ProcedureManagementComponent {
  constructor(
  ) {}
}
