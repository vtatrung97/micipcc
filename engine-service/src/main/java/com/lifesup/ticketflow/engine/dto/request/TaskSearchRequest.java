package com.lifesup.ticketflow.engine.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Tìm task đang mở. Các tiêu chí kết hợp AND; riêng candidateUser + candidateGroups được hiểu là
 * "task người dùng có thể nhận" (là candidate trực tiếp hoặc qua nhóm).
 */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TaskSearchRequest {
    /** Task đã giao cho người này. */
    String assignee;
    /** Task chưa giao mà người này có thể nhận. */
    String candidateUser;
    List<String> candidateGroups = new ArrayList<>();
    String processInstanceId;

    @Min(value = 1, message = "{validation.page.min}")
    int page = 1;

    @Min(value = 1, message = "{validation.size.range}")
    @Max(value = 100, message = "{validation.size.range}")
    int size = 20;
}
