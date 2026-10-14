package com.lifesup.ticketflow.engine.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Nhận việc: task chưa giao chuyển cho người dùng. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ClaimTaskRequest {
    @NotBlank(message = "{validation.userId.required}")
    String userId;
}
