package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.dto.response.AgentGroupResponse;
import com.lifesup.ticketflow.core.entity.AgentGroupEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AgentGroupRepository extends JpaRepository<AgentGroupEntity, String> {

    /** @param agentGroupName chuỗi LIKE đã escape, VD "%cskh%"; null = không lọc */
    @Query(value = """
                    select new com.lifesup.ticketflow.core.dto.response.AgentGroupResponse(
                        g.agentGroupId, g.agentGroupCode, g.agentGroupName, g.description, g.realmName,
                        g.kzAccountId, g.groupId, g.status, g.agentLeaderId)
                    from AgentGroupEntity g
                    where (:agentGroupName is null or g.agentGroupName like :agentGroupName escape '\\')
                    """,
            countQuery = """
                    select count(g) from AgentGroupEntity g
                    where (:agentGroupName is null or g.agentGroupName like :agentGroupName escape '\\')
                    """)
    Page<AgentGroupResponse> search(@Param("agentGroupName") String agentGroupName, Pageable pageable);
}
