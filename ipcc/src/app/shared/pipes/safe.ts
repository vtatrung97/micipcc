import {DomSanitizer} from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'safeHtml'})
export class Safe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {
  }

  transform(style:string) {
    style = style.replace(/(<style\b[^>]*>)[^<>]*(<\/style>)/i, '').replace(/(<script\b[^>]*>)[^<>]*(<\/script>)/i, '');
    style = style.replace(/table-layout:fixed;/i, '');
    style = style.replace(/style_0/i, 'html-report-style');
    // return this.sanitizer.bypassSecurityTrustHtml(style);
    return style;
  }
}
