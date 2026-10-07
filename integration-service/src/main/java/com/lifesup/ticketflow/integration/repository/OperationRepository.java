package com.lifesup.ticketflow.integration.repository;

import com.lifesup.ticketflow.integration.dto.response.OperationSummaryResponse;
import com.lifesup.ticketflow.integration.entity.OperationEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface OperationRepository extends JpaRepository<OperationEntity, Long> {

    /**
     * Danh sách API chưa xoá thuộc kết nối và hệ thống chưa xoá, lọc theo tên.
     * Chỉ lấy cột tóm tắt.
     *
     * @param keyword chuỗi LIKE đã escape, VD "%tra cuu%"; null = không lọc
     */
    @Query("""
            select new com.lifesup.ticketflow.integration.dto.response.OperationSummaryResponse(
                o.id, o.code, o.versionNo, o.name, o.description, o.httpMethod, o.path, o.status,
                c.id, c.code, c.name, s.id, s.code, s.name, o.updatedAt, o.updatedBy)
            from OperationEntity o
            join ConnectionEntity c on c.id = o.connectionId and c.deleted = false
            join ExternalSystemEntity s on s.id = c.systemId and s.deleted = false
            where o.deleted = false
              and (:keyword is null or o.name like :keyword escape '\\')
            """)
    List<OperationSummaryResponse> search(
            @Param("keyword") String keyword,
            Sort sort);
}
