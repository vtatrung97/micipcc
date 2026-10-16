import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

export const USER_KEY = 'usr';

export interface User {
  name: string;
  id: number;
  avatar: string;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private _notify$ = new BehaviorSubject<any>({});
  get notify(): Observable<any> {
    return this._notify$.asObservable();
  }

  // setLayout(options?: AppSettings): AppSettings {
  //   this._options = Object.assign(defaults, options);
  //   return this._options;
  // }
  //
  // setNavState(type: string, value: boolean) {
  //   this._notify$.next({type, value} as any);
  // }
  //
  // getOptions(): AppSettings {
  //   return this._options;
  // }
  //
  // setUser(value: User) {
  //   this._store.set(USER_KEY, value);
  // }
  //
  // removeUser() {
  //   this._store.remove(USER_KEY);
  // }

  setLanguage(lang: string) {
    this._notify$.next({lang});
  }
}
