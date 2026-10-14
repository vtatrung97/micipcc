package com.lifesup.ticketflow.engine.dto.canvas.model;

/**
 * Cấu hình của một node, bám đúng hợp đồng JSON FE gửi (flowJson.nodes[].config).
 * Mỗi loại node có đúng một class cấu hình; JOIN và 3 loại gateway dùng chung class tương ứng.
 *
 * <p>Mapper parse cấu hình ở chế độ strict: field lạ hoặc sai kiểu đều báo lỗi NODE_CONFIG_INVALID,
 * không bỏ qua im lặng.
 */
public sealed interface NodeConfig permits StartNodeConfig, GatewayNodeConfig, JoinNodeConfig,
        UserTaskNodeConfig, SystemTaskNodeConfig, NotificationNodeConfig, SubProcessNodeConfig, EndNodeConfig {
}
