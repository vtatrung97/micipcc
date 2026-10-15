import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InspectionFilterService {
  private filterState1: any = null;
  private filterState2: any = null;

  // private readonly filterSubject = new BehaviorSubject<any>(null);

  // readonly filterState$ = this.filterSubject.asObservable();

  // setFilter(filter: any) {
  //     this.filterSubject.next(filter);
  // }

  // getCurrentFilter() {
  //     return this.filterSubject.value;
  // }

  setFilterState1(state: any) {
    this.filterState1 = state;
  }

  getFilterState1() {
    return this.filterState1;
  }

  clearFilterState1() {
    this.filterState1 = null;
  }

  setFilterState2(state: any) {
    this.filterState2 = state;
  }

  getFilterState2() {
    return this.filterState2;
  }

  clearFilterState2() {
    this.filterState2 = null;
  }
}
