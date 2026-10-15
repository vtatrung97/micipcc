import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replaceDashWithSlash' })
export class ReplaceDashWithSlashPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Tách phần ngày và phần giờ
    const [datePart, timePartRaw] = value.split(' ');

    const parts = datePart.split('-');
    let day: string, month: string, year: string;

    // yyyy-MM-dd
    if (parts[0].length === 4) {
      [year, month, day] = parts;
    }
    // dd-MM-yyyy
    else {
      [day, month, year] = parts;
    }

    let formatted = `${day}/${month}/${year}`;

    // Nếu có giờ phút giây thì xử lý
    if (timePartRaw) {
      // Bỏ đuôi .000 nếu có
      const timePart = timePartRaw.replace(/\.000$/, '');
      formatted += ` ${timePart}`;
    }

    return formatted;
  }
}
