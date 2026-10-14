package com.lifesup.ticketflow.engine.node.gateway;

import com.lifesup.ticketflow.engine.workflow.NodeConfig;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** JOIN: gộp các nhánh của gateway {@code gatewayNodeId}. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class JoinNodeConfig implements NodeConfig {
    String gatewayNodeId;
}
