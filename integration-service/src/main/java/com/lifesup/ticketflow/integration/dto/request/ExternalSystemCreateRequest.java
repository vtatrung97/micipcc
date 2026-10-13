package com.lifesup.ticketflow.integration.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.ticketflow.common.json.StringTrimDeserializer;
import com.lifesup.ticketflow.integration.common.enums.Environment;
import com.lifesup.ticketflow.integration.common.enums.Status;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ExternalSystemCreateRequest {

    @Schema(description = "Mã hệ thống, không đổi sau khi tạo", example = "CRM")
    @NotBlank(message = "{validation.system.code.required}")
    @Size(max = 100, message = "{validation.system.code.size}")
    @Pattern(regexp = "^[A-Za-z0-9_.-]+$", message = "{validation.system.code.pattern}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String code;

    @Schema(example = "Hệ thống chăm sóc khách hàng")
    @NotBlank(message = "{validation.system.name.required}")
    @Size(max = 255, message = "{validation.system.name.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String name;

    @Schema(description = "Bỏ trống = không phân biệt môi trường")
    Environment environment;

    @Size(max = 1000, message = "{validation.system.description.size}")
    String description;

    @Schema(description = "Mặc định ACTIVE")
    Status status;
}
