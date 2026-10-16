import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private filters = new Map<string, BehaviorSubject<any>>();

  private getOrCreateSubject<T>(
    key: string,
    defaultValue: T
  ): BehaviorSubject<T> {

    if (!this.filters.has(key)) {
      this.filters.set(key, new BehaviorSubject<T>(defaultValue));
    }

    return this.filters.get(key) as BehaviorSubject<T>;
  }

  getFilter$<T>(
    key: string,
    defaultValue: T
  ): Observable<T> {

    return this.getOrCreateSubject(key, defaultValue).asObservable();
  }

  getCurrentFilter<T>(
    key: string,
    defaultValue: T
  ): T {

    return this.getOrCreateSubject(key, defaultValue).value;
  }

  setFilter<T>(
    key: string,
    filter: T
  ): void {
    const clone = JSON.parse(JSON.stringify(filter));
    this.getOrCreateSubject(key, filter).next(clone);

  }

  clearFilter(key: string): void {
    this.filters.delete(key);
  }
}
