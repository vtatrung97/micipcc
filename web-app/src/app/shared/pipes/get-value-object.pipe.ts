import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getValue'
})
export class GetValuePipe implements PipeTransform {
  transform(obj: any, key: string): any {
    if (!obj || !key) {
      return null;
    }
    return obj[key];
  }
}
/* pipe để lấy giá trị của key của 1 object*/
