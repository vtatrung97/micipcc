package com.lifesup.ticketflow.core.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.ticketflow.core.common.enums.SlaUnit;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.common.json.StringTrimDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
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

    @Schema(description = "Phân loại nhóm quy trình. Không truyền thì giữ nguyên")
    @Size(max = 100, message = "{validation.ticketCallFlow.category.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String category;

    @Size(max = 1000, message = "{validation.ticketCallFlow.description.size}")
    String description;

    @Schema(description = "Không truyền thì giữ nguyên")
    @Valid
    TicketCallFlowTriggerDto trigger;

    @Schema(description = "Thời hạn xử lý (SLA). Không truyền thì giữ nguyên, truyền thì kèm slaUnit", example = "3")
    @Min(value = 1, message = "{validation.ticketCallFlow.slaValue.min}")
    Integer slaValue;

    @Schema(description = "Không truyền thì giữ nguyên, truyền thì kèm slaValue")
    SlaUnit slaUnit;

    @Schema(description = "Để trống thì giữ nguyên trạng thái hiện tại")
    TicketCallFlowStatus status;

    @Schema(description = "Chuỗi JSON của canvas, BE lưu và trả lại nguyên văn", example = "{\"nodes\":[],\"edges\":[]}")
    @NotBlank(message = "{validation.ticketCallFlow.flowJson.required}")
    String flowJson;

    @Schema(description = "Tên phiên bản. Không truyền thì giữ nguyên", example = "Bổ sung bước xác minh")
    @Size(max = 255, message = "{validation.ticketCallFlow.versionName.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String versionName;

    @Schema(description = "Mô tả thay đổi của phiên bản. Không truyền thì giữ nguyên",
            example = "Thêm bước Bổ sung thông tin cho PAKN thiếu dữ liệu.")
    @Size(max = 1000, message = "{validation.ticketCallFlow.versionDescription.size}")
    String versionDescription;

    @Schema(description = "rowVersion lấy từ lần GET gần nhất. Có truyền thì BE chặn lưu đè nếu người khác đã sửa trước (409)")
    Long rowVersion;
}
