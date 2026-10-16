import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { SERVICES } from '@env/environment';
import { ApiResponse } from '../models/flow-definition.model';
import {
  NodeIconConfirmRequest,
  NodeIconDto,
  NodeIconPresignRequest,
  NodeIconPresignResult,
} from '../models/node-icon.model';
import { ICON_ACCEPT, ICON_MAX_BYTES } from './node-icon.service';

/** ⚠ Endpoint đề xuất — chờ BE chốt */
const getBaseUrl = () => (SERVICES?.CORE_SERVICE_API?.url || '').replace(/\/+$/, '');
const ICON_API = {
  presign: () => `${getBaseUrl()}/api/v1/files/presigned-upload`,
  icons: () => `${getBaseUrl()}/api/v1/node-icons`,
};

/**
 * Gọi API icon của bước. Tải lên theo 3 bước:
 * xin presigned URL → PUT tệp thẳng lên S3 → báo BE lưu bản ghi icon.
 */
@Injectable({ providedIn: 'root' })
export class NodeIconApiService {
  /** HttpClient không qua interceptor: PUT lên S3 không được kèm Authorization / cookie */
  private readonly rawHttp: HttpClient;

  constructor(
    private http: HttpClient,
    httpBackend: HttpBackend,
  ) {
    this.rawHttp = new HttpClient(httpBackend);
  }

  /** Tải một tệp icon lên S3 và lưu bản ghi; tệp sai định dạng / quá 10MB báo lỗi ngay, không gọi API */
  uploadIcon(file: File): Observable<NodeIconDto> {
    if (!ICON_ACCEPT.includes(file.type) || file.size > ICON_MAX_BYTES) {
      return throwError(() => new Error(`INVALID_FILE:${file.name}`));
    }
    const presignBody: NodeIconPresignRequest = {
      fileName: file.name,
      contentType: file.type,
      size: file.size,
      folder: 'node-icons',
    };
    return this.http.post<ApiResponse<NodeIconPresignResult>>(ICON_API.presign(), presignBody).pipe(
      map((res) => res.result),
      switchMap((presign) =>
        this.putToS3(presign, file).pipe(
          switchMap(() => this.confirmUpload({ fileKey: presign.fileKey, fileName: file.name, contentType: file.type, size: file.size })),
        ),
      ),
    );
  }

  /** Danh sách icon đã tải lên */
  getIcons(): Observable<NodeIconDto[]> {
    return this.http.get<ApiResponse<NodeIconDto[]>>(ICON_API.icons()).pipe(map((res) => res.result || []));
  }

  /** Xoá icon (BE xoá cả tệp trên S3) */
  deleteIcon(id: string): Observable<void> {
    return this.http.delete<ApiResponse<unknown>>(`${ICON_API.icons()}/${encodeURIComponent(id)}`).pipe(map(() => undefined));
  }

  private putToS3(presign: NodeIconPresignResult, file: File): Observable<unknown> {
    const headers = new HttpHeaders({ 'Content-Type': file.type, ...(presign.headers || {}) });
    return this.rawHttp.put(presign.uploadUrl, file, { headers, responseType: 'text' });
  }

  private confirmUpload(body: NodeIconConfirmRequest): Observable<NodeIconDto> {
    return this.http.post<ApiResponse<NodeIconDto>>(ICON_API.icons(), body).pipe(map((res) => res.result));
  }
}
