package com.lifesup.ticketflow.core.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.ticketflow.common.json.StringTrimDeserializer;
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

/** Nhân bản quy trình: bản sao giữ nguyên flowJson của bản gốc, luôn ở trạng thái DRAFT. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowCloneRequest {

    @Schema(description = "Mã của bản sao, không trùng mã đang có", example = "KHIEU_NAI_DA_PHONG_BAN_V2")
    @NotBlank(message = "{validation.ticketCallFlow.code.required}")
    @Size(max = 100, message = "{validation.ticketCallFlow.code.size}")
    @Pattern(regexp = "^[A-Za-z0-9_.-]+$", message = "{validation.ticketCallFlow.code.pattern}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String code;

    @Schema(example = "Xử lý khiếu nại đa phòng ban (bản sao)")
    @NotBlank(message = "{validation.ticketCallFlow.name.required}")
    @Size(max = 255, message = "{validation.ticketCallFlow.name.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String name;

    @Schema(description = "Tiền tố mã hồ sơ: chữ in hoa không dấu và số, không đổi sau khi tạo", example = "PAKN")
    @NotBlank(message = "{validation.ticketCallFlow.caseCodePrefix.required}")
    @Size(max = 20, message = "{validation.ticketCallFlow.caseCodePrefix.size}")
    @Pattern(regexp = "^[A-Z0-9]+$", message = "{validation.ticketCallFlow.caseCodePrefix.pattern}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String caseCodePrefix;

    @Schema(description = "Để trống thì lấy mô tả của bản gốc")
    @Size(max = 1000, message = "{validation.ticketCallFlow.description.size}")
    String description;
}
