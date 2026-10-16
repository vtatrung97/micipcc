import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mapListDataByKey'
})
export class MapListDataByKeyPipe implements PipeTransform {

  transform(
    value: any,
    list: any[],
    keyValue: string,
    keyName: string
  ): string {
    if (!value || !Array.isArray(list)) {
      return "";
    }

    const values = String(value).split(',');

    const result = values
      .map(v => {
        const found = list.find(
          item => String(item[keyValue]).trim() === v.trim()
        );
        return found ? found[keyName] : null;
      })
      .filter(v => v !== null); // ✅ loại null

    return result.join(', ');
  }

}
