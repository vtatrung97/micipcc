package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowStatsResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse;
import com.lifesup.ticketflow.core.entity.TemplateEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TemplateRepository extends JpaRepository<TemplateEntity, Long> {

    Optional<TemplateEntity> findByIdAndDeletedFalse(Long id);

    boolean existsByCodeAndDeletedFalse(String code);

    boolean existsByCaseCodePrefixAndDeletedFalse(String caseCodePrefix);

    /**
     * Danh sách quy trình chưa xoá kèm số phiên bản hiệu lực / bản nháp, lọc theo từ khoá (mã/tên/tiền tố mã hồ sơ),
     * trạng thái và có bản nháp hay không. Chỉ lấy cột tóm tắt, không đọc flow_json (có thể rất lớn).
     *
     * @param keyword  chuỗi LIKE đã escape, VD "%khieu nai%"; null = không lọc
     * @param hasDraft true = chỉ quy trình có bản nháp, false = chỉ quy trình không có, null = không lọc
     */
    @Query(value = """
                    select new com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse(
                        t.id, t.code, t.name, t.caseCodePrefix, t.description, t.status,
                        p.versionNo, p.publishedAt, d.versionNo, d.updatedAt, d.updatedBy,
                        t.createdAt, t.createdBy, t.updatedAt, t.updatedBy, t.rowVersion)
                    from TemplateEntity t
                    left join TemplateVersionEntity p
                        on p.templateId = t.id
                        and p.status = com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus.PUBLISHED
                    left join TemplateVersionEntity d
                        on d.templateId = t.id
                        and d.status = com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus.DRAFT
                    where t.deleted = false
                      and (:status is null or t.status = :status)
                      and (:keyword is null or t.code like :keyword escape '\\' or t.name like :keyword escape '\\'
                           or t.caseCodePrefix like :keyword escape '\\')
                      and (:hasDraft is null or (:hasDraft = true and d.id is not null) or (:hasDraft = false and d.id is null))
                    """,
            countQuery = """
                    select count(t) from TemplateEntity t
                    left join TemplateVersionEntity d
                        on d.templateId = t.id
                        and d.status = com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus.DRAFT
                    where t.deleted = false
                      and (:status is null or t.status = :status)
                      and (:keyword is null or t.code like :keyword escape '\\' or t.name like :keyword escape '\\'
                           or t.caseCodePrefix like :keyword escape '\\')
                      and (:hasDraft is null or (:hasDraft = true and d.id is not null) or (:hasDraft = false and d.id is null))
                    """)
    Page<TicketCallFlowSummaryResponse> search(
            @Param("keyword") String keyword,
            @Param("status") TicketCallFlowStatus status,
            @Param("hasDraft") Boolean hasDraft,
            Pageable pageable);

    /** Tổng số quy trình chưa xoá, số đang hiệu lực và số có bản nháp. */
    @Query("""
            select new com.lifesup.ticketflow.core.dto.response.TicketCallFlowStatsResponse(
                count(t),
                coalesce(sum(case when t.status = com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus.ACTIVE
                                  then 1 else 0 end), 0),
                count(d))
            from TemplateEntity t
            left join TemplateVersionEntity d
                on d.templateId = t.id
                and d.status = com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus.DRAFT
            where t.deleted = false
            """)
    TicketCallFlowStatsResponse stats();
}
