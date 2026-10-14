package com.lifesup.ticketflow.core.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Thứ tự field khớp constructor dùng trong UserAccountRepository.search. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AgentResponse {
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "700000000000000001")
    Long id;
    String keycloakId;
    String username;
    String fullName;
    String email;
    /** 0 = INACTIVE, 1 = ACTIVE. */
    short status;
    String kzUserId;
    String kzAccountId;
    String realm;
    String groupId;
    String managerUser;
}
