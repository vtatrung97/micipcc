import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'abbrevationName'
})
export class AbbreviationNamePipe implements PipeTransform {

  transform(fullName: string = "", ...args: unknown[]): string {

    if (fullName) {
      if (fullName.match(/^[0-9]+$/) != null) {
        //SDT
        return fullName.slice(-2)
      } else {
        // NAME
        let firstName = fullName.split(' ').slice(0, -1).join(' ');
        let lastName = fullName.split(' ').slice(-1).join(' ');
        return  (firstName[0] || "") + (lastName[0] || "");
      }
    } else {
      return ""
    }

  }

}
