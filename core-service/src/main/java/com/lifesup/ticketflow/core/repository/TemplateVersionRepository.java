package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowSubProcessResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionSummaryResponse;
import com.lifesup.ticketflow.core.dto.response.UserOptionResponse;
import com.lifesup.ticketflow.core.entity.TemplateVersionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TemplateVersionRepository extends JpaRepository<TemplateVersionEntity, Long> {

    /** Chỉ dùng với PUBLISHED (mỗi quy trình tối đa 1 bản); DRAFT / ARCHIVED có thể nhiều bản. */
    Optional<TemplateVersionEntity> findByTemplateIdAndStatus(Long templateId, TicketCallFlowVersionStatus status);

    Optional<TemplateVersionEntity> findByIdAndTemplateId(Long id, Long templateId);

    Optional<TemplateVersionEntity> findFirstByTemplateIdOrderByVersionNoDesc(Long templateId);

    long countByTemplateId(Long templateId);

    @Query("select coalesce(max(v.versionNo), 0) from TemplateVersionEntity v where v.templateId = :templateId")
    int findMaxVersionNo(@Param("templateId") Long templateId);

    /**
     * Quy trình chọn được làm quy trình con: chưa xoá, đang ban hành (ACTIVE + bản PUBLISHED), loại kích hoạt khác
     * SCHEDULE (NULL = quy trình cũ chưa có loại kích hoạt, vẫn lấy), bản ban hành không chứa node Quy trình con.
     *
     * @param realm null = mọi realm
     * @param keyword chuỗi LIKE đã escape, so với mã / tên; null = không lọc
     * @param excludeId quy trình bỏ khỏi danh sách; null = không bỏ
     */
    @Query(value = """
                    select new com.lifesup.ticketflow.core.dto.response.TicketCallFlowSubProcessResponse(
                        t.id, t.code, t.name, t.triggerType, v.id, v.versionNo, v.inputParams, v.outputParams)
                    from TemplateVersionEntity v
                    join TemplateEntity t on t.id = v.templateId
                    where t.deleted = false
                      and t.status = com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus.ACTIVE
                      and v.status = com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus.PUBLISHED
                      and v.hasSubProcess = false
                      and (t.triggerType is null
                           or t.triggerType <> com.lifesup.ticketflow.core.common.enums.TriggerType.SCHEDULE)
                      and (:realm is null or t.realm = :realm)
                      and (:excludeId is null or t.id <> :excludeId)
                      and (:keyword is null or t.code like :keyword escape '\\' or t.name like :keyword escape '\\')
                    order by t.name, t.id
                    """,
            countQuery = """
                    select count(v) from TemplateVersionEntity v
                    join TemplateEntity t on t.id = v.templateId
                    where t.deleted = false
                      and t.status = com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus.ACTIVE
                      and v.status = com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus.PUBLISHED
                      and v.hasSubProcess = false
                      and (t.triggerType is null
                           or t.triggerType <> com.lifesup.ticketflow.core.common.enums.TriggerType.SCHEDULE)
                      and (:realm is null or t.realm = :realm)
                      and (:excludeId is null or t.id <> :excludeId)
                      and (:keyword is null or t.code like :keyword escape '\\' or t.name like :keyword escape '\\')
                    """)
    Page<TicketCallFlowSubProcessResponse> searchSubProcesses(
            @Param("realm") String realm,
            @Param("keyword") String keyword,
            @Param("excludeId") Long excludeId,
            Pageable pageable);

    /** Số quy trình chưa xoá có ít nhất 1 bản nháp. */
    @Query("""
            select count(distinct v.templateId)
            from TemplateVersionEntity v
            join TemplateEntity t on t.id = v.templateId and t.deleted = false
            where v.status = com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus.DRAFT
            """)
    long countTemplatesHavingDraft();

    /** Lịch sử phiên bản, mới nhất trước, không đọc flow_json. */
    @Query("""
            select new com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionSummaryResponse(
                v.id, v.versionNo, v.status, v.versionName, v.versionDescription, v.publishedAt, v.publishedBy,
                v.createdAt, v.createdBy, v.updatedAt, v.updatedBy)
            from TemplateVersionEntity v
            where v.templateId = :templateId
            order by v.versionNo desc
            """)
    List<TicketCallFlowVersionSummaryResponse> findSummariesByTemplateId(@Param("templateId") Long templateId);

    /**
     * Người tạo phiên bản của các quy trình chưa xoá, tìm trong user_account theo họ tên / username, sắp theo tên.
     *
     * @param keyword chuỗi LIKE đã escape; null = lấy tất cả
     */
    @Query("""
            select distinct new com.lifesup.ticketflow.core.dto.response.UserOptionResponse(
                u.keycloakId, coalesce(u.fullName, u.username))
            from TemplateVersionEntity v
            join TemplateEntity t on t.id = v.templateId
            join UserAccountEntity u on u.keycloakId = v.createdBy
            where t.deleted = false
              and (:keyword is null or u.fullName like :keyword escape '\\' or u.username like :keyword escape '\\')
            order by coalesce(u.fullName, u.username)
            """)
    List<UserOptionResponse> findCreators(@Param("keyword") String keyword);

    /** Như {@link #findCreators} nhưng theo người cập nhật. */
    @Query("""
            select distinct new com.lifesup.ticketflow.core.dto.response.UserOptionResponse(
                u.keycloakId, coalesce(u.fullName, u.username))
            from TemplateVersionEntity v
            join TemplateEntity t on t.id = v.templateId
            join UserAccountEntity u on u.keycloakId = v.updatedBy
            where t.deleted = false
              and (:keyword is null or u.fullName like :keyword escape '\\' or u.username like :keyword escape '\\')
            order by coalesce(u.fullName, u.username)
            """)
    List<UserOptionResponse> findUpdaters(@Param("keyword") String keyword);
}
