package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionSummaryResponse;
import com.lifesup.ticketflow.core.entity.TemplateVersionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TemplateVersionRepository extends JpaRepository<TemplateVersionEntity, Long> {

    /** Bản DRAFT hoặc PUBLISHED của quy trình (mỗi trạng thái này tối đa 1 bản). */
    Optional<TemplateVersionEntity> findByTemplateIdAndStatus(Long templateId, TicketCallFlowVersionStatus status);

    Optional<TemplateVersionEntity> findByTemplateIdAndVersionNo(Long templateId, Integer versionNo);

    @Query("select coalesce(max(v.versionNo), 0) from TemplateVersionEntity v where v.templateId = :templateId")
    int findMaxVersionNo(@Param("templateId") Long templateId);

    /** Lịch sử phiên bản, mới nhất trước, không đọc flow_json. */
    @Query("""
            select new com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionSummaryResponse(
                v.versionNo, v.status, v.versionName, v.versionDescription, v.publishedAt, v.publishedBy,
                v.createdAt, v.createdBy, v.updatedAt, v.updatedBy)
            from TemplateVersionEntity v
            where v.templateId = :templateId
            order by v.versionNo desc
            """)
    List<TicketCallFlowVersionSummaryResponse> findSummariesByTemplateId(@Param("templateId") Long templateId);
}
