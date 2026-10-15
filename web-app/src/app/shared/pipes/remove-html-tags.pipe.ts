import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'removeHtmlTags'
})
export class RemoveHtmlTagsPipe implements PipeTransform {
  transform(value?: string, ...args: any): any {
      return value ? value.replace(/<[^>]*>(\n*\s*|\s*\n*|\s*|\n*)/g, '') : value; // NOSONAR
  }
}
