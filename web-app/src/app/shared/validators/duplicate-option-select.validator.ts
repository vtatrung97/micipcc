import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function duplicateValuesValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value?.trim();

        if (!value) {
            return null;
        }

        const parts = value.split(',').map((p: string) => p.trim());
        const unique = new Set(parts);

        return unique.size !== parts.length
            ? { duplicateOptionValues: true }
            : null;
    };
}
/*chỉ cho phép nhập các giá trị khác nhau. mỗi otpion cách nhau bởi dấu , => áp dụng cho việc cấu hình option cho select*/
