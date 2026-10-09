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
     * tên, mã, trạng thái, có bản nháp, phiên bản hiệu lực, khoảng cập nhật / ban hành.
     * Chỉ lấy cột tóm tắt, không đọc flow_json (có thể rất lớn).
     * Sort dùng alias t (quy trình), p (bản hiệu lực), d (bản nháp).
     *
     * @param keyword  chuỗi LIKE đã escape, VD "%khieu nai%"; null = không lọc (tương tự name, code)
     * @param hasDraft true = chỉ quy trình có bản nháp, false = chỉ quy trình không có, null = không lọc
     * @param updatedFrom mốc dưới, các mốc thời gian đều tính cả hai đầu
     */
    @Query(value = """
                    select new com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse(
                        t.id, t.code, t.name, t.caseCodePrefix, t.category, t.description, t.status,
                        t.triggerType, t.slaValue, t.slaUnit,
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
                      and (:name is null or t.name like :name escape '\\')
                      and (:code is null or t.code like :code escape '\\')
                      and (:hasDraft is null or (:hasDraft = true and d.id is not null) or (:hasDraft = false and d.id is null))
                      and (:publishedVersionNo is null or p.versionNo = :publishedVersionNo)
                      and (:updatedFrom is null or t.updatedAt >= :updatedFrom)
                      and (:updatedTo is null or t.updatedAt <= :updatedTo)
                      and (:publishedFrom is null or p.publishedAt >= :publishedFrom)
                      and (:publishedTo is null or p.publishedAt <= :publishedTo)
                    """,
            countQuery = """
                    select count(t) from TemplateEntity t
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
                      and (:name is null or t.name like :name escape '\\')
                      and (:code is null or t.code like :code escape '\\')
                      and (:hasDraft is null or (:hasDraft = true and d.id is not null) or (:hasDraft = false and d.id is null))
                      and (:publishedVersionNo is null or p.versionNo = :publishedVersionNo)
                      and (:updatedFrom is null or t.updatedAt >= :updatedFrom)
                      and (:updatedTo is null or t.updatedAt <= :updatedTo)
                      and (:publishedFrom is null or p.publishedAt >= :publishedFrom)
                      and (:publishedTo is null or p.publishedAt <= :publishedTo)
                    """)
    Page<TicketCallFlowSummaryResponse> search(
            @Param("keyword") String keyword,
            @Param("name") String name,
            @Param("code") String code,
            @Param("status") TicketCallFlowStatus status,
            @Param("hasDraft") Boolean hasDraft,
            @Param("publishedVersionNo") Integer publishedVersionNo,
            @Param("updatedFrom") Long updatedFrom,
            @Param("updatedTo") Long updatedTo,
            @Param("publishedFrom") Long publishedFrom,
            @Param("publishedTo") Long publishedTo,
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
