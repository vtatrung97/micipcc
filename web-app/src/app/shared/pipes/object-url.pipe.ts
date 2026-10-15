import {Pipe, PipeTransform} from '@angular/core';

import {FileService} from "@core/services/ticket/file.service";
import {AuthService} from "@core/services/auth/auth.service";
import {Observable} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {DomSanitizer} from "@angular/platform-browser";

@Pipe({
    name: 'objectUrl'
})
export class ObjectUrlPipe implements PipeTransform {
    constructor(private fileService: FileService,
                private sanitizer: DomSanitizer) {
    }

    transform(fileUrl = ''): Observable<any> {
        return this.fileService.getContentFile(fileUrl).pipe(map((res: any) => {
            let url =  URL.createObjectURL(res.body);

            let a = this.sanitizer.bypassSecurityTrustResourceUrl(url) ; // NOSONAR
            return a
        }))
    }
}
