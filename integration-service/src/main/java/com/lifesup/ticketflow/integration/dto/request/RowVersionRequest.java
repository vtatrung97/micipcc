package com.lifesup.ticketflow.integration.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Body của các thao tác đổi trạng thái: chỉ cần rowVersion để chống ghi đè. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RowVersionRequest {

    @Schema(description = "rowVersion lấy từ lần GET gần nhất; có truyền mà khác DB thì trả 409")
    Long rowVersion;
}
