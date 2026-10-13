import { SelectOption } from '@shared/components/ant-select/ant-select.component';

/**
 * Danh mục cho drawer node Thông báo.
 * ⚠ Người dùng hệ thống là dữ liệu giả lập — chờ API danh sách tài khoản (ipcc_account).
 */

/** Kênh gửi (tích hợp OmniX) */
export const NOTIFICATION_CHANNELS = ['EMAIL', 'SMS'];

/** Nguồn người nhận: lấy từ biến quy trình / chọn người dùng hệ thống */
export const NOTIFICATION_SOURCES = ['VARIABLE', 'USER'];

export const NOTIFICATION_LIMITS = {
  title: 255,
  content: 500,
};

export const NOTIFICATION_USER_OPTIONS: SelectOption[] = [
  { value: 'an.nguyen', label: 'Nguyễn Văn An (an.nguyen)' },
  { value: 'binh.tran', label: 'Trần Thị Bình (binh.tran)' },
  { value: 'cuong.le', label: 'Lê Văn Cường (cuong.le)' },
  { value: 'dung.pham', label: 'Phạm Thị Dung (dung.pham)' },
  { value: 'em.hoang', label: 'Hoàng Văn Em (em.hoang)' },
  { value: 'giang.vu', label: 'Vũ Thị Giang (giang.vu)' },
  { value: 'huy.dang', label: 'Đặng Quốc Huy (huy.dang)' },
  { value: 'lan.bui', label: 'Bùi Thị Lan (lan.bui)' },
];
