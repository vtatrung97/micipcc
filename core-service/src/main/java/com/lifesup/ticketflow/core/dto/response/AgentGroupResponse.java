package com.lifesup.ticketflow.core.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Thứ tự field khớp constructor dùng trong AgentGroupRepository.search. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AgentGroupResponse {
    String agentGroupId;
    String agentGroupCode;
    String agentGroupName;
    String description;
    String realmName;
    String kzAccountId;
    String groupId;
    Integer status;
    String agentLeaderId;
}
