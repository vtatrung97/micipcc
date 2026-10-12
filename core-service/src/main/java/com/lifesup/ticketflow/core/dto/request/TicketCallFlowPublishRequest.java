package com.lifesup.ticketflow.core.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.ticketflow.common.json.StringTrimDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Dùng cho publish / huỷ bản nháp: rowVersion để chặn thao tác trên dữ liệu cũ.
 * Khi publish có thể đặt luôn tên / mô tả phiên bản (huỷ bản nháp bỏ qua 2 trường này).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowPublishRequest {

    @Schema(description = "rowVersion lấy từ lần GET gần nhất. Có truyền thì BE chặn nếu người khác đã sửa trước (409)")
    Long rowVersion;

    @Schema(description = "Tên phiên bản. Không truyền thì giữ tên đã lưu ở bản nháp", example = "Bổ sung bước xác minh")
    @Size(max = 255, message = "{validation.ticketCallFlow.versionName.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String versionName;

    @Schema(description = "Mô tả thay đổi. Không truyền thì giữ mô tả đã lưu ở bản nháp",
            example = "Thêm bước Bổ sung thông tin cho PAKN thiếu dữ liệu.")
    @Size(max = 1000, message = "{validation.ticketCallFlow.versionDescription.size}")
    String versionDescription;
}
