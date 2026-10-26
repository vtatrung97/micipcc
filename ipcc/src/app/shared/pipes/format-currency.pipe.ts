import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'formatCurrency'
})
export class FormatCurrencyPipe extends CurrencyPipe implements PipeTransform {
  private decimal_separator:string='.';
  private thousands_separator:string = ',';

  override transform(value: any, args?: any): any {
  if (value == null || value.toString().trim() === '') {
    return null;
  }

  let formatted: string | null = null;

  const floatValue = parseFloat(value);
  const isInteger = Number.isInteger(floatValue);

  try {
    // Different format depends on integers or real numbers
    if (isInteger) {
      // No decimal number
      formatted = super.transform(floatValue, args, 'symbol', '1.0-0');
    } else {
      // Currently 2 to 3 decimal numbers
      formatted = super.transform(floatValue, args, 'symbol', '1.2-3');
    }
  } catch (error) {
    return value;
  }

  if (formatted) {
    let cleanString = formatted.replace(/([^0-9,.]+)/gi, '');
    if (floatValue < 0) {
      cleanString = '-' + cleanString;
    }
    return cleanString;
  }

  return null;
}

  parse(value: any): any{
    if(value){
      let number = value.split(this.decimal_separator)[0];
      number = number.replace(new RegExp(this.thousands_separator, "g"), "");
      return number;
    }
    return null;
  }
}

@Pipe({ name: 'findBy', pure: false })
export class FindByPipe implements PipeTransform {
  transform(items: any[], searchText: string, propsName: string[]): any[] {
    if (!items) { return []; }
    if (!searchText) { return items; }
    if (!propsName) { return items; }
    searchText = searchText.toLowerCase();
    // @ts-ignore
    return items.filter( it => {
      for (const propName of propsName) {
        const isMatched = it[propName].toLowerCase().includes(searchText);
        if (isMatched) {
          return true;
        }
      }
    });
   }
}
