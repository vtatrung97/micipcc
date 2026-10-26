import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function decimalNumberValidator(): ValidatorFn {
  const regex = /^\d+(\.\d+)?$/;

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (value === null || value === '') {
      return null;
    }

    return regex.test(String(value))
      ? null
      : { decimalNumber: true };
  };
}
/*chỉ cho phép nhập số nguyên và số thập phân có dấu . để ngăn cách phần thập phân*/
