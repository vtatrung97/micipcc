-- -----------------------------------------------------------------------------------------------------
-- Dữ liệu mock biểu mẫu (form → form_field) để FE dùng API tìm kiếm khi chưa có luồng tạo.
-- Chạy lại không lỗi (INSERT IGNORE theo id cố định).
-- Xoá: DELETE form_field rồi form theo id 9000000000000002xx.
-- -----------------------------------------------------------------------------------------------------

INSERT IGNORE INTO form
    (id, code, name, title, description, deleted, realm, created_at, created_by, row_version)
VALUES
    (900000000000000201, 'BM01', 'Phản ánh thông tin khách hàng', 'Nhập phản ánh thông tin khách hàng', NULL, 0,
     'demo', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0),
    (900000000000000202, 'BM02', 'Khiếu nại cước', 'Nhập thông tin khiếu nại cước', 'Biểu mẫu tiếp nhận khiếu nại cước di động', 0,
     'demo', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0),
    (900000000000000203, 'BM03', 'Yêu cầu hỗ trợ kỹ thuật', 'Nhập yêu cầu hỗ trợ kỹ thuật', NULL, 0,
     'demo', CAST(UNIX_TIMESTAMP(NOW(3)) * 1000 AS UNSIGNED), 'system', 0);

INSERT IGNORE INTO form_field
    (id, form_id, code, name, data_type, options, position, required)
VALUES
    (900000000000000211, 900000000000000201, 'HANG_KHACH_HANG', 'Hạng khách hàng', 'COMBOBOX_SINGLE', '["VIP", "KHTV"]', 1, 1),
    (900000000000000212, 900000000000000201, 'TEN_KHACH_HANG', 'Tên khách hàng', 'TEXTBOX', NULL, 2, 1),

    (900000000000000221, 900000000000000202, 'SO_THUE_BAO', 'Số thuê bao', 'TEXTBOX', NULL, 1, 1),
    (900000000000000222, 900000000000000202, 'LOAI_CUOC', 'Loại cước', 'COMBOBOX_MULTI', '["Thoại", "SMS", "Data", "Dịch vụ GTGT"]', 2, 1),
    (900000000000000223, 900000000000000202, 'KY_CUOC', 'Kỳ cước', 'COMBOBOX_SINGLE', '["Tháng hiện tại", "Tháng trước", "Khác"]', 3, 0),
    (900000000000000224, 900000000000000202, 'NOI_DUNG', 'Nội dung khiếu nại', 'TEXTBOX', NULL, 4, 0),

    (900000000000000231, 900000000000000203, 'SO_THUE_BAO', 'Số thuê bao', 'TEXTBOX', NULL, 1, 1),
    (900000000000000232, 900000000000000203, 'LOAI_SU_CO', 'Loại sự cố', 'COMBOBOX_SINGLE', '["Mất sóng", "Không truy cập được Internet", "Không gọi được"]', 2, 1);
