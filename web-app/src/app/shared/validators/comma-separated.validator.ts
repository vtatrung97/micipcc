import {
    AbstractControl,
    ValidationErrors,
    ValidatorFn,
} from '@angular/forms';

export function commaSeparatedValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value?.trim();

        // Không validate khi rỗng (required sẽ xử lý nếu cần)
        if (!value) {
            return null;
        }

        const regex = /^[^,\s][^,]*(\s*,\s*[^,\s][^,]*)*$/;

        return regex.test(value)
            ? null
            : { commaSeparated: true };
    };
}
/*chỉ cho phép nhập cách nhau bởi 1 dấu , -> tức là không có 2 dấu , liên tiếp, không có dấu , ở đầu và cuối*/
