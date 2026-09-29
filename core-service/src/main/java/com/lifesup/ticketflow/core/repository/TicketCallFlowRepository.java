package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse;
import com.lifesup.ticketflow.core.entity.TicketCallFlowEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TicketCallFlowRepository extends JpaRepository<TicketCallFlowEntity, Long> {

    Optional<TicketCallFlowEntity> findByIdAndDeletedFalse(Long id);

    boolean existsByCodeAndDeletedFalse(String code);

    /**
     * Danh sách quy trình chưa xoá, lọc theo từ khoá (mã/tên) và trạng thái.
     * Chỉ lấy các cột tóm tắt, không đọc flow_json (có thể rất lớn).
     *
     * @param keyword chuỗi LIKE đã escape, VD "%khieu nai%"; null = không lọc
     */
    @Query(value = """
                    select new com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse(
                        t.id, t.code, t.name, t.description, t.status,
                        t.createdAt, t.createdBy, t.updatedAt, t.updatedBy, t.rowVersion)
                    from TicketCallFlowEntity t
                    where t.deleted = false
                      and (:status is null or t.status = :status)
                      and (:keyword is null or t.code like :keyword escape '\\' or t.name like :keyword escape '\\')
                    """,
            countQuery = """
                    select count(t) from TicketCallFlowEntity t
                    where t.deleted = false
                      and (:status is null or t.status = :status)
                      and (:keyword is null or t.code like :keyword escape '\\' or t.name like :keyword escape '\\')
                    """)
    Page<TicketCallFlowSummaryResponse> search(
            @Param("keyword") String keyword, @Param("status") TicketCallFlowStatus status, Pageable pageable);
}
