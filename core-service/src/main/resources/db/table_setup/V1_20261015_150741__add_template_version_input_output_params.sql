-- Dữ liệu đầu vào / đầu ra của từng phiên bản quy trình (VD để node Quy trình con map dữ liệu cha ↔ con).
-- Lưu JSON array object, hiện chỉ có name: [{"name": "so_thue_bao"}, {"name": "loai_khieu_nai"}]; thêm thuộc tính thì thêm key.
ALTER TABLE template_version
    ADD COLUMN IF NOT EXISTS input_params  LONGTEXT NULL COMMENT 'Dữ liệu đầu vào của quy trình (JSON array: name)' AFTER input_schema,
    ADD COLUMN IF NOT EXISTS output_params LONGTEXT NULL COMMENT 'Dữ liệu đầu ra của quy trình (JSON array: name)' AFTER input_params,
    ADD CONSTRAINT IF NOT EXISTS ck_template_version_input_params  CHECK (input_params  IS NULL OR JSON_VALID(input_params)),
    ADD CONSTRAINT IF NOT EXISTS ck_template_version_output_params CHECK (output_params IS NULL OR JSON_VALID(output_params));
