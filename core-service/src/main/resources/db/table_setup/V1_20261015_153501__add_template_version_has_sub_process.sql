-- Cờ phiên bản có chứa node Quy trình con (FE gửi kèm khi lưu). Danh sách chọn quy trình con chỉ lấy bản ban hành
-- không chứa quy trình con, tránh lồng nhiều cấp.
ALTER TABLE template_version
    ADD COLUMN IF NOT EXISTS has_sub_process TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1 = canvas có node Quy trình con' AFTER output_params;
