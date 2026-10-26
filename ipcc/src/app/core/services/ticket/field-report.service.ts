import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ToastService } from '@core/services/toast-service';
import { AbstractService } from '@core/services/abstract.service';
import { TranslateService } from '@ngx-translate/core';
import { ResponseEnvelope } from '@core/models/response.model';
import { SERVICES } from '@env/environment';

export interface ValidationResult {
  valid: boolean;
  message?: string;
  status?: string;
}
export interface PahtUpdateRequest {
  PahtId: string;
  Source: string;
  Department: string;
  TimeProcess: string;
  Result: string;
}

@Injectable({ providedIn: 'root' })
export class FieldReportService extends AbstractService {
  protected http: HttpClient;

  constructor(
    http: HttpClient,
    toastService: ToastService,
    translate: TranslateService
  ) {
    super(http, toastService, translate);
    this.http = http;
  }

  get SERVICE_URL(): string {
    return `${SERVICES.TICKET_SERVICE_API.url}/api/v1/field-report`;

  }

  public createFieldReport(
    ticketId: string,
    requestTime: number,
    fieldReport: any
  ): Observable<ResponseEnvelope<any>> {
    const url = `${this.SERVICE_URL}/${ticketId}/init`;
    const params = new HttpParams().set('requestTime', requestTime.toString());

    return this.http.post<ResponseEnvelope<any>>(url, fieldReport, { params });
  }

  uploadFileToMinio(file: File): Observable<{ fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ fileName: string }>('/api/minio/upload', formData);
  }
  getPahtDetailInfoByTicketId(ticketId: string): Observable<any> {
    const url = `${this.SERVICE_URL}/info/${ticketId}`;
    return this.http.get<any>(url).pipe(
      map(res => res?.data ?? null),
      catchError(err => {
        console.error('Lỗi khi lấy PAHT detail:', err);
        return of(null);
      })
    );
  }
  public updatePahtDetail(request: PahtUpdateRequest): Observable<any> {
    const url = `${SERVICES.TICKET_SERVICE_API.url}/private/api/v1/paht`;

    return this.http.put<any>(url, request).pipe(
      map(res => {
        return res;
      }),
      catchError(err => {
        console.error('Lỗi khi cập nhật PAHT:', err);
        return of(null);
      })
    );
  }



  public validateField(fieldName: string, value: string): Observable<ValidationResult> {
    const params = { fieldName, value };

    return this.http.post<any>(
      `${this.SERVICE_URL}/validate-field`,
      null,
      { params, observe: 'response' }
    ).pipe(
      map(response => {
        const body = response.body;
        if (body?.data?.status === 'error' && body.data.data?.[fieldName]) {
          return {
            valid: false,
            message: body.data.data[fieldName],
            status: 'error'
          };
        }
        return { valid: true };
      }),
      catchError(error => {
        const nestedError = error?.error?.data?.data?.[fieldName];
        if (nestedError) {
          return of({
            valid: false,
            message: nestedError,
            status: 'error'
          });
        }
        return of({
          valid: false,
          message: 'Lỗi không xác định từ hệ thống',
          status: 'error'
        });
      })
    );
  }

  public validateName(name: string): Observable<ValidationResult> {
    return this.validateField('HoTen', name);
  }

  public validateTitle(title: string): Observable<ValidationResult> {
    return this.validateField('TieuDe', title);
  }

  public validateContent(content: string): Observable<ValidationResult> {
    return this.validateField('NoiDung', content);
  }

  public validateLocation(location: string): Observable<ValidationResult> {
    return this.validateField('DiaDiem', location);
  }

  public validatePhoneNumber(phone: string): Observable<ValidationResult> {
    return this.validateField('phoneNumber', phone);
  }

  public validateIdNumber(idNumber: string): Observable<ValidationResult> {
    return this.validateField('soDinhDanh', idNumber);
  }
}
