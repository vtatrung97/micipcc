import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'hyphenize'
})
export class HyphenizePipe implements PipeTransform {
  transform(value: any, ...args: any): any {
    return value ? value.split(' ').join('-') : value;
  }
}
