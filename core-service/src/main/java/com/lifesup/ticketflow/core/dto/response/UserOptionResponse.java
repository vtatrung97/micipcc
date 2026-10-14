package com.lifesup.ticketflow.core.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Người dùng cho dropdown. Thứ tự field khớp constructor dùng trong TemplateVersionRepository. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserOptionResponse {
    /** Keycloak user id, cùng giá trị với createdBy / updatedBy. */
    String id;
    /** Họ tên, chưa có thì username. */
    String name;
}
