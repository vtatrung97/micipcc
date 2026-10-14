package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse;
import com.lifesup.ticketflow.core.entity.TemplateEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TemplateRepository extends JpaRepository<TemplateEntity, Long> {

    Optional<TemplateEntity> findByIdAndDeletedFalse(Long id);

    boolean existsByCodeAndDeletedFalse(String code);

    long countByDeletedFalse();

    long countByDeletedFalseAndStatus(TicketCallFlowStatus status);

    /**
     * Nhóm quy trình (category) đang dùng ở các quy trình chưa xoá, không trùng, sắp xếp A-Z.
     *
     * @param keyword chuỗi LIKE đã escape; null = lấy tất cả
     */
    @Query("""
            select distinct t.category from TemplateEntity t
            where t.deleted = false
              and t.category is not null and t.category <> ''
              and (:keyword is null or t.category like :keyword escape '\\')
            order by t.category
            """)
    List<String> findCategories(@Param("keyword") String keyword);

    /**
     * Danh sách phiên bản của các quy trình chưa xoá, mỗi phiên bản một dòng (quy trình 10 phiên bản = 10 dòng),
     * lọc theo từ khoá (mã/tên), tên, mã, trạng thái quy trình, trạng thái / số phiên bản,
     * khoảng cập nhật / ban hành của phiên bản.
     * Chỉ lấy cột tóm tắt, không đọc model_json (có thể rất lớn).
     * Sort dùng alias t (quy trình), v (phiên bản).
     *
     * @param keyword chuỗi LIKE đã escape, VD "%khieu nai%"; null = không lọc (tương tự name, code)
     * @param updatedFrom mốc dưới, các mốc thời gian đều tính cả hai đầu
     */
    @Query(value = """
                    select new com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse(
                        t.id, v.id, t.code, t.name, t.category, t.description, t.status,
                        t.triggerType, t.slaValue, t.slaUnit,
                        v.versionNo, v.status, v.versionName, v.publishedAt, v.publishedBy,
                        v.createdAt, v.createdBy, v.updatedAt, v.updatedBy, t.rowVersion)
                    from TemplateVersionEntity v
                    join TemplateEntity t on t.id = v.templateId
                    where t.deleted = false
                      and (:status is null or t.status = :status)
                      and (:versionStatus is null or v.status = :versionStatus)
                      and (:versionNo is null or v.versionNo = :versionNo)
                      and (:keyword is null or t.code like :keyword escape '\\' or t.name like :keyword escape '\\')
                      and (:name is null or t.name like :name escape '\\')
                      and (:code is null or t.code like :code escape '\\')
                      and (:updatedFrom is null or v.updatedAt >= :updatedFrom)
                      and (:updatedTo is null or v.updatedAt <= :updatedTo)
                      and (:publishedFrom is null or v.publishedAt >= :publishedFrom)
                      and (:publishedTo is null or v.publishedAt <= :publishedTo)
                    """,
            countQuery = """
                    select count(v) from TemplateVersionEntity v
                    join TemplateEntity t on t.id = v.templateId
                    where t.deleted = false
                      and (:status is null or t.status = :status)
                      and (:versionStatus is null or v.status = :versionStatus)
                      and (:versionNo is null or v.versionNo = :versionNo)
                      and (:keyword is null or t.code like :keyword escape '\\' or t.name like :keyword escape '\\')
                      and (:name is null or t.name like :name escape '\\')
                      and (:code is null or t.code like :code escape '\\')
                      and (:updatedFrom is null or v.updatedAt >= :updatedFrom)
                      and (:updatedTo is null or v.updatedAt <= :updatedTo)
                      and (:publishedFrom is null or v.publishedAt >= :publishedFrom)
                      and (:publishedTo is null or v.publishedAt <= :publishedTo)
                    """)
    Page<TicketCallFlowSummaryResponse> search(
            @Param("keyword") String keyword,
            @Param("name") String name,
            @Param("code") String code,
            @Param("status") TicketCallFlowStatus status,
            @Param("versionStatus") TicketCallFlowVersionStatus versionStatus,
            @Param("versionNo") Integer versionNo,
            @Param("updatedFrom") Long updatedFrom,
            @Param("updatedTo") Long updatedTo,
            @Param("publishedFrom") Long publishedFrom,
            @Param("publishedTo") Long publishedTo,
            Pageable pageable);
}
