-- IF EXISTS: chạy lại được sau khi xoá dòng version này trong flyway_schema_history.

-- Một quy trình được có nhiều bản nháp (DRAFT) cùng lúc: sửa bản đang ban hành thì sinh phiên bản mới,
-- sửa bản ở trạng thái khác thì ghi đè chính bản đó.
-- Bỏ luôn cột ảo published_template_id: "tối đa 1 bản PUBLISHED / quy trình" do ứng dụng đảm bảo
-- (ban hành bản mới thì chuyển bản PUBLISHED cũ sang ARCHIVED).
ALTER TABLE template_version
    DROP INDEX IF EXISTS uk_template_version_draft,
    DROP INDEX IF EXISTS uk_template_version_published,
    DROP COLUMN IF EXISTS draft_template_id,
    DROP COLUMN IF EXISTS published_template_id;

-- Bỏ tiền tố mã hồ sơ của quy trình: không có trong tài liệu nghiệp vụ, chưa dùng để sinh mã.
-- Bỏ cột ảo active_code: mã quy trình trùng được kiểm ở ứng dụng theo cột deleted (quy trình chưa xoá).
-- Bỏ unique key + cột ảo trước vì cột ảo phụ thuộc case_code_prefix.
ALTER TABLE template
    DROP INDEX IF EXISTS uk_template_active_case_prefix,
    DROP INDEX IF EXISTS uk_template_active_code,
    DROP COLUMN IF EXISTS active_case_code_prefix,
    DROP COLUMN IF EXISTS active_code;
ALTER TABLE template
    DROP COLUMN IF EXISTS case_code_prefix;
