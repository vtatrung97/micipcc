package com.lifesup.ticketflow.engine.workflow;

/**
 * Cấu hình của một loại node, bám đúng JSON FE gửi ({@code flowJson.nodes[].config}).
 * Parse strict: field lạ hoặc sai kiểu là lỗi NODE_CONFIG_INVALID, không bỏ qua im lặng.
 * Cấu hình cũng được ghi vào BPMN (tf:config) để bean runtime đọc lại khi chạy.
 */
public interface NodeConfig {
}
