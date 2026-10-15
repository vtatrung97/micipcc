import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  // Tạo BehaviorSubject để lưu và phát giá trị
  private dataShare = new BehaviorSubject<any>(null);
  currentData = this.dataShare.asObservable();

  sendDataShare(message: any) {
    this.dataShare.next(message);
  }
}
