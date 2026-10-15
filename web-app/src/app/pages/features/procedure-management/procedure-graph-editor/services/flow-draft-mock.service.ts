import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiResponse, FlowDetailResponse, SaveFlowDraftPayload } from '../models/flow-definition.model';

/**
 * Giả lập BE cho "Lưu nháp" / "Mở flow": lưu response vào localStorage theo mã quy trình.
 * Khi có API thật: saveDraft → PUT /ticket-call-flows/{id}, getFlow → GET /ticket-call-flows/{id}.
 */
@Injectable({ providedIn: 'root' })
export class FlowDraftMockService {
  private readonly KEY_PREFIX = 'mock_flow_draft_';

  public saveDraft(code: string, payload: SaveFlowDraftPayload): Observable<ApiResponse<FlowDetailResponse>> {
    const current = this.read(code);
    if (current && payload.rowVersion !== undefined && payload.rowVersion !== current.rowVersion) {
      return throwError(() => ({ status: 409, message: 'Quy trình đã được người khác cập nhật (rowVersion không khớp)' }));
    }

    const result: FlowDetailResponse = {
      id: current?.id || `mock_${code}`,
      code,
      name: payload.name,
      description: payload.description,
      flowJsonVersionNo: current?.flowJsonVersionNo || 1,
      flowJsonVersionStatus: 'DRAFT',
      rowVersion: (current?.rowVersion || 0) + 1,
      flowJson: payload.flowJson
    };
    try {
      localStorage.setItem(this.KEY_PREFIX + code, JSON.stringify(result));
    } catch {}
    return of({ code: 200, message: 'Thành công', result }).pipe(delay(200));
  }

  public getFlow(code: string): Observable<ApiResponse<FlowDetailResponse> | null> {
    const result = this.read(code);
    return of(result ? { code: 200, message: 'Thành công', result } : null);
  }

  private read(code: string): FlowDetailResponse | null {
    try {
      const raw = localStorage.getItem(this.KEY_PREFIX + code);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
