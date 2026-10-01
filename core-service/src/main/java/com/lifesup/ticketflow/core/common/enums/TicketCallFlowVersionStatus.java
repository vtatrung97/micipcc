package com.lifesup.ticketflow.core.common.enums;

/** Trạng thái một phiên bản canvas của quy trình. */
public enum TicketCallFlowVersionStatus {
    /** Bản nháp đang sửa, mỗi quy trình tối đa 1 bản. */
    DRAFT,
    /** Bản đang hiệu lực, mỗi quy trình tối đa 1 bản. */
    PUBLISHED,
    /** Bản hiệu lực cũ, đã bị thay bởi lần publish sau. */
    ARCHIVED
}
