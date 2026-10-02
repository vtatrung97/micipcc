import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from '@core/http/api.service';

export interface ActionSchemaField {
  key: string;
  type: string;
  required?: boolean;
  label?: string;
}

export interface ActionItem {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
  description: string;
  version: string;
  provider: string;
  status: 'Active' | 'Inactive' | 'Draft';
  input_schema?: ActionSchemaField[];
  output_schema?: ActionSchemaField[];
}

@Injectable({
  providedIn: 'root'
})
export class ActionLibraryService {
  private readonly endpoint = '/actions';
  private actionsSubject = new BehaviorSubject<ActionItem[]>([]);
  public actions$: Observable<ActionItem[]> = this.actionsSubject.asObservable();

  constructor(private apiService: ApiService) {}

  /**
   * Lấy danh sách Action Library từ backend API.
   */
  public fetchActions(): Observable<ActionItem[]> {
    return this.apiService.get<{ actions: ActionItem[] } | ActionItem[]>(this.endpoint).pipe(
      map(res => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.actions)) return res.actions;
        return [];
      }),
      tap(actions => this.actionsSubject.next(actions))
    );
  }

  public getActions(): ActionItem[] {
    return this.actionsSubject.value;
  }

  public getActionById(id: string): ActionItem | undefined {
    return this.actionsSubject.value.find(a => a.id === id || a.code === id);
  }

  public createAction(action: Partial<ActionItem>): Observable<ActionItem> {
    return this.apiService.post<ActionItem>(this.endpoint, action).pipe(
      tap(newAction => {
        const updated = [newAction, ...this.actionsSubject.value];
        this.actionsSubject.next(updated);
      })
    );
  }
}
