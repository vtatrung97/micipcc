import {
  Component,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  HostListener,
  ElementRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ]
})
export class DatePickerComponent implements ControlValueAccessor {
  @Input() isRange: boolean = false;
  @Input() placeholder?: string;
  @Input() startPlaceholder?: string;
  @Input() endPlaceholder?: string;
  @Input() disabled: boolean = false;
  @Input() allowClear: boolean = true;

  @Output() dateChange = new EventEmitter<any>();

  isOpen: boolean = false;
  rawStart: string = '';
  rawEnd: string = '';

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private elRef: ElementRef) {}

  get hasValue(): boolean {
    return !!(this.rawStart || this.rawEnd);
  }

  get displaySingle(): string {
    return this.formatDisplay(this.rawStart);
  }

  get displayStart(): string {
    return this.formatDisplay(this.rawStart);
  }

  get displayEnd(): string {
    return this.formatDisplay(this.rawEnd);
  }

  private formatDisplay(isoDate: string): string {
    if (!isoDate) return '';
    const parts = isoDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  }

  writeValue(val: any): void {
    if (!val) {
      this.rawStart = '';
      this.rawEnd = '';
    } else if (typeof val === 'string') {
      this.rawStart = val;
    } else if (typeof val === 'object') {
      this.rawStart = val.from || val.start || '';
      this.rawEnd = val.to || val.end || '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  togglePicker(event: MouseEvent): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.onTouched();
    }
  }

  onDateChange(event: Event, type: 'start' | 'end'): void {
    const val = (event.target as HTMLInputElement).value;
    if (type === 'start') {
      this.rawStart = val;
    } else {
      this.rawEnd = val;
    }
  }

  selectPreset(preset: 'today' | '7days' | '30days' | 'thisMonth'): void {
    const today = new Date();
    const toStr = today.toISOString().split('T')[0];
    let fromDate = new Date();

    if (preset === 'today') {
      fromDate = today;
    } else if (preset === '7days') {
      fromDate.setDate(today.getDate() - 7);
    } else if (preset === '30days') {
      fromDate.setDate(today.getDate() - 30);
    } else if (preset === 'thisMonth') {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    this.rawStart = fromDate.toISOString().split('T')[0];
    this.rawEnd = toStr;
    this.applySelection();
  }

  applySelection(): void {
    this.isOpen = false;
    const value = this.isRange 
      ? { from: this.rawStart, to: this.rawEnd } 
      : this.rawStart;
    this.onChange(value);
    this.dateChange.emit(value);
  }

  clearValue(event: MouseEvent): void {
    event.stopPropagation();
    this.rawStart = '';
    this.rawEnd = '';
    const value = this.isRange ? { from: '', to: '' } : '';
    this.onChange(value);
    this.dateChange.emit(value);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.onTouched();
    }
  }
}
