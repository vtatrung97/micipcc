import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Một nút radio theo Figma ProcessX (node 237:11006 / component "Radio").
 * Ô tròn 20px: chưa chọn nền trắng viền Neutral/300; đã chọn nền + viền Primary/600, dấu ✓ trắng 14px.
 * Thường dùng qua `app-radio-group`; dùng lẻ khi cần tự bố trí (bind [checked] + (selected)).
 */
@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.scss']
})
export class RadioComponent {
  @Input() checked: boolean = false;
  @Input() label?: string;
  @Input() description?: string;
  @Input() disabled: boolean = false;
  /** name của input radio để trình duyệt gom nhóm (điều hướng bằng phím mũi tên) */
  @Input() name?: string;

  /** Phát khi người dùng chọn radio này */
  @Output() selected = new EventEmitter<void>();

  readonly checkIcon = 'assets/icons/processx/radio-check.svg';

  onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.disabled) {
      input.checked = this.checked;
      return;
    }
    if (input.checked) this.selected.emit();
  }
}
