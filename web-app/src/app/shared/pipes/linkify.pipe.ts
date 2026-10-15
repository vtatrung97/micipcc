import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'linkify'
})
export class LinkifyPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) {}

    transform(text: string): SafeHtml {
        if (!text) return text;

        const urlRegex = /((https?:\/\/|www\.)[^\s]+|([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}([\/?#][^\s]*)?)/gi;

        const replacedText = text.replace(urlRegex, (url) => {
            const fullUrl = url.startsWith('http') ? url : 'http://' + url;
            return `<a class="link-text" href="${fullUrl}" target="_blank">${url}</a>`;
        });

        // Dùng DomSanitizer để Angular render HTML an toàn
        return this.sanitizer.bypassSecurityTrustHtml(replacedText);
    }
}
