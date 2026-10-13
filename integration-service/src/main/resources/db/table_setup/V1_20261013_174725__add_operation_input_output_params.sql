-- Định nghĩa input / output của API cho màn thiết kế Flow (JSON array). requestMapping chỉ dựng body,
-- responseMapping dựng object output; path / headers / queryParams dùng tham số qua {name}.
-- Dữ liệu cũ: 2 cột mới để NULL, operation đã có vẫn hợp lệ.
ALTER TABLE operation
    ADD COLUMN input_params  LONGTEXT NULL COMMENT 'Tham số đầu vào (JSON array: name, label, type, required, defaultValue, description)' AFTER query_params,
    ADD COLUMN output_params LONGTEXT NULL COMMENT 'Giá trị đầu ra cho Flow (JSON array: name, label, type, description)' AFTER input_params,
    MODIFY request_mapping  LONGTEXT NULL COMMENT 'JSONata dựng BODY request từ $input (không gồm header / query / path)',
    MODIFY response_mapping LONGTEXT NULL COMMENT 'JSONata dựng object output (key = outputParams.name) từ $response',
    ADD CONSTRAINT ck_operation_input_params  CHECK (input_params  IS NULL OR JSON_VALID(input_params)),
    ADD CONSTRAINT ck_operation_output_params CHECK (output_params IS NULL OR JSON_VALID(output_params));
