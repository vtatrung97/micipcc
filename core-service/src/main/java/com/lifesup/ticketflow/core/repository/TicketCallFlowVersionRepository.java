package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionSummaryResponse;
import com.lifesup.ticketflow.core.entity.TicketCallFlowVersionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TicketCallFlowVersionRepository extends JpaRepository<TicketCallFlowVersionEntity, Long> {

    /** Bản DRAFT hoặc PUBLISHED của quy trình (mỗi trạng thái này tối đa 1 bản). */
    Optional<TicketCallFlowVersionEntity> findByFlowIdAndStatus(Long flowId, TicketCallFlowVersionStatus status);

    Optional<TicketCallFlowVersionEntity> findByFlowIdAndVersionNo(Long flowId, Integer versionNo);

    @Query("select coalesce(max(v.versionNo), 0) from TicketCallFlowVersionEntity v where v.flowId = :flowId")
    int findMaxVersionNo(@Param("flowId") Long flowId);

    /** Lịch sử phiên bản, mới nhất trước, không đọc flow_json. */
    @Query("""
            select new com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionSummaryResponse(
                v.versionNo, v.status, v.versionName, v.versionDescription, v.publishedAt, v.publishedBy,
                v.createdAt, v.createdBy, v.updatedAt, v.updatedBy)
            from TicketCallFlowVersionEntity v
            where v.flowId = :flowId
            order by v.versionNo desc
            """)
    List<TicketCallFlowVersionSummaryResponse> findSummariesByFlowId(@Param("flowId") Long flowId);
}
