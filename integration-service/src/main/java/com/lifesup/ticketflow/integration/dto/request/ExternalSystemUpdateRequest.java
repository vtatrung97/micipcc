package com.lifesup.ticketflow.integration.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.ticketflow.common.json.StringTrimDeserializer;
import com.lifesup.ticketflow.integration.common.enums.Environment;
import com.lifesup.ticketflow.integration.common.enums.Status;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Sửa hệ thống (mã không đổi). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExternalSystemUpdateRequest {

    @NotBlank(message = "{validation.system.name.required}")
    @Size(max = 255, message = "{validation.system.name.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String name;

    Environment environment;

    @Size(max = 1000, message = "{validation.system.description.size}")
    String description;

    @Schema(description = "Bỏ trống = giữ nguyên. Không tự đổi trạng thái của connection / API bên dưới")
    Status status;

    @Schema(description = "rowVersion lấy từ lần GET gần nhất; có truyền mà khác DB thì trả 409")
    Long rowVersion;
}
