package com.lifesup.ticketflow.engine.dto.canvas.model;

import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** JOIN: gộp các nhánh của gateway {@code gatewayNodeId}, chuyển thành gateway cùng loại. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public final class JoinNodeConfig implements NodeConfig {
    String gatewayNodeId;
}
