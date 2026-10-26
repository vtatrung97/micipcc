import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ImgViewerService {
  private imgClickSrc = new Subject<string>();
  imgClick$ = this.imgClickSrc.asObservable();
  announceImgClicked(url: string) {
    this.imgClickSrc.next(url);
  }
}
