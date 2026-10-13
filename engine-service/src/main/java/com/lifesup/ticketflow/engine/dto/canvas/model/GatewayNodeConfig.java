package com.lifesup.ticketflow.engine.dto.canvas.model;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * GATEWAY_EXCLUSIVE / GATEWAY_INCLUSIVE / GATEWAY_PARALLEL. Nhánh mặc định và nhánh lỗi không nằm trong
 * {@code cases}, chỉ thể hiện bằng edge có sourceHandle {@code default} / {@code error}.
 */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public final class GatewayNodeConfig implements NodeConfig {
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<GatewayCase> cases = new ArrayList<>();
    /** Node JOIN gộp các nhánh của gateway này. */
    String joinNodeId;
}
