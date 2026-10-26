import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'slaStatus'
})
export class SlaStatusPipe implements PipeTransform {
  transform(minutesRemaining: number): string {
    if (minutesRemaining < 0) {
      return `Quá hạn ${Math.abs(minutesRemaining)} phút (Overdue)`;
    }
    if (minutesRemaining <= 30) {
      return `Sắp hết hạn (${minutesRemaining} phút)`;
    }
    return `Đang trong hạn (${minutesRemaining} phút)`;
  }
}
