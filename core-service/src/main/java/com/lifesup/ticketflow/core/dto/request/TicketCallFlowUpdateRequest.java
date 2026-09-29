package com.lifesup.ticketflow.core.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.configuration.StringTrimDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Lưu lại toàn bộ quy trình (mã quy trình không đổi). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowUpdateRequest {

    @NotBlank(message = "{validation.ticketCallFlow.name.required}")
    @Size(max = 255, message = "{validation.ticketCallFlow.name.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String name;

    @Size(max = 1000, message = "{validation.ticketCallFlow.description.size}")
    String description;

    @Schema(description = "Để trống thì giữ nguyên trạng thái hiện tại")
    TicketCallFlowStatus status;

    @Schema(description = "Chuỗi JSON của canvas, BE lưu và trả lại nguyên văn", example = "{\"nodes\":[],\"edges\":[]}")
    @NotBlank(message = "{validation.ticketCallFlow.flowJson.required}")
    String flowJson;

    @Schema(description = "rowVersion lấy từ lần GET gần nhất. Có truyền thì BE chặn lưu đè nếu người khác đã sửa trước (409)")
    Long rowVersion;
}
