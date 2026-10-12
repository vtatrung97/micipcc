/**
 * Hợp đồng API icon của bước (lưu tệp trên S3).
 * ⚠ Đề xuất phía FE — chờ BE chốt endpoint và tên field.
 */

/** Body xin URL tải lên S3 (presigned) */
export interface NodeIconPresignRequest {
  fileName: string;
  contentType: string;
  /** byte */
  size: number;
  /** Thư mục trên bucket */
  folder: 'node-icons';
}

/** `result` khi xin URL tải lên */
export interface NodeIconPresignResult {
  /** URL PUT tệp thẳng lên S3, hết hạn sau vài phút */
  uploadUrl: string;
  /** Key của tệp trên bucket, gửi lại khi xác nhận */
  fileKey: string;
  /** Header bắt buộc kèm khi PUT (nếu BE ký kèm header) */
  headers?: Record<string, string>;
}

/** Body xác nhận đã tải lên xong → BE lưu bản ghi icon */
export interface NodeIconConfirmRequest {
  fileKey: string;
  fileName: string;
  contentType: string;
  size: number;
}

/** Một icon đã lưu trên server */
export interface NodeIconDto {
  id: string;
  fileName: string;
  /** URL hiển thị (CDN / S3 public hoặc presigned GET) */
  fileUrl: string;
  contentType: string;
  size: number;
  createdAt?: string;
}
