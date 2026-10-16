import {Pipe, PipeTransform} from '@angular/core';

import {FileService} from "@core/services/ticket/file.service";
import {AuthService} from "@core/services/auth/auth.service";

@Pipe({
    name: 'urlFromMinioPath'
})
export class UrlFromMinioPathPipe implements PipeTransform {
    constructor(private fileService: FileService,
                private authService: AuthService) {
    }

    transform(filePath = ''): any {
        return this.fileService.getURLContentFilePublic(filePath, this.authService.realmName);
    }
}
