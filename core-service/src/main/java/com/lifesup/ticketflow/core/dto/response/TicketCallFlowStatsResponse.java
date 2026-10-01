package com.lifesup.ticketflow.core.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Số liệu đầu màn danh sách quy trình (chỉ tính quy trình chưa xoá). */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowStatsResponse {
    long total;
    /** Đang hiệu lực: trạng thái ACTIVE. */
    long active;
    /** Có bản nháp chưa publish. */
    long hasDraft;
}
