import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firstSixChar'
})
export class FirstSixCharPipe implements PipeTransform {

  transform(value: string = "", ...args: unknown[]): unknown {
    return value.substring(0 , 6);
  }

}
