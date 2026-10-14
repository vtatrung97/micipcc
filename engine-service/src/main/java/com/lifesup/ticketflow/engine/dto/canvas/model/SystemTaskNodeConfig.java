package com.lifesup.ticketflow.engine.dto.canvas.model;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** SYSTEM_TASK: gọi một API đã khai báo trong integration-service. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public final class SystemTaskNodeConfig implements NodeConfig {
    /** Mã hệ thống ngoài (external_system.code). */
    String systemId;
    /** Mã API (operation.code). */
    String apiId;
    /** Timeout mỗi lần gọi (giây); null = dùng cấu hình của operation. */
    Integer timeout;
    /** Số lần thử lại khi lỗi; null = dùng cấu hình của operation. integration-service là nơi thực hiện retry. */
    Integer retry;
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<ApiInputMapping> inputs = new ArrayList<>();
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<ApiOutputMapping> outputs = new ArrayList<>();
}
