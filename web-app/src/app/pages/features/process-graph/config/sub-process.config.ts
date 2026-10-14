import { SelectOption } from '@shared/components/ant-select/ant-select.component';

/**
 * Trường đầu vào / đầu ra của quy trình con.
 * ⚠ Dữ liệu giả lập — chờ API trả về biến khởi tạo và dữ liệu đầu ra của quy trình được chọn.
 */
export const SUB_PROCESS_INPUT_FIELDS: SelectOption[] = [
  { value: 'ticketId', label: 'Mã ticket' },
  { value: 'channelType', label: 'Loại kênh' },
  { value: 'content', label: 'Nội dung phản ánh' },
  { value: 'customerPhone', label: 'Số điện thoại' },
  { value: 'customerName', label: 'Tên khách hàng' },
  { value: 'priority', label: 'Mức ưu tiên' }
];

export const SUB_PROCESS_OUTPUT_FIELDS: SelectOption[] = [
  { value: 'title', label: 'Tiêu đề' },
  { value: 'result', label: 'Kết quả' },
  { value: 'status', label: 'Trạng thái' },
  { value: 'resolvedBy', label: 'Người xử lý' },
  { value: 'resolvedAt', label: 'Thời điểm hoàn thành' }
];
