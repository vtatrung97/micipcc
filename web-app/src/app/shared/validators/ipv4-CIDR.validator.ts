import { AbstractControl, ValidationErrors } from '@angular/forms';

export function ipv4Validator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
  const cidrRegex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}\/([0-9]|[1-2][0-9]|3[0-2])$/;
  const rangeRegex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}-(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

  const parts = control.value.split(',').map((p: string) => p.trim());

  const isValid = parts.every(
    (part: string) => ipv4Regex.test(part) || cidrRegex.test(part) || rangeRegex.test(part)
  );

  return isValid ? null : { invalidIps: true };
}
