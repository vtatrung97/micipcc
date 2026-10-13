package com.lifesup.ticketflow.engine.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Deploy một phiên bản quy trình (core gọi khi publish). */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DeployDefinitionRequest {
    /** Mã template, dùng làm process key; quy trình con gọi nhau theo mã này. */
    @NotBlank(message = "{validation.processKey.required}")
    @Pattern(regexp = "^[A-Za-z_][A-Za-z0-9_.-]*$", message = "{validation.processKey.pattern}")
    String processKey;

    @NotBlank(message = "{validation.processName.required}")
    String processName;

    /** Số phiên bản template (template_version.version_no), lưu vào category của deployment để truy vết. */
    @Min(value = 1, message = "{validation.versionNo.min}")
    Integer versionNo;

    @NotBlank(message = "{validation.flowJson.required}")
    String flowJson;

    /** Tenant của Flowable (VD realm), bỏ trống nếu không tách tenant. */
    String tenantId;
}
