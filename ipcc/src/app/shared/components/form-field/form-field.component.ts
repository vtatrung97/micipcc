import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss']
})
export class FormFieldComponent {
  @Input() label?: string;
  @Input() required: boolean = false;
  @Input() colon: boolean = false;
  @Input() hint?: string;
  @Input() error?: string;
  /** Khoảng cách dưới field (px). Đặt 0 khi container cha đã tự chia gap (vd: drawer) */
  @Input() spacing: number = 16;
}
