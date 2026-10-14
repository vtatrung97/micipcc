package com.lifesup.ticketflow.engine.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Huỷ một phiên chạy đang chạy. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CancelInstanceRequest {
    /** Lý do huỷ, lưu vào lịch sử. */
    String reason;
}
