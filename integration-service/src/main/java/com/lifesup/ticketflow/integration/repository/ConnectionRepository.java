package com.lifesup.ticketflow.integration.repository;

import com.lifesup.ticketflow.integration.common.enums.AuthType;
import com.lifesup.ticketflow.integration.common.enums.Protocol;
import com.lifesup.ticketflow.integration.common.enums.Status;
import com.lifesup.ticketflow.integration.dto.response.ConnectionSummaryResponse;
import com.lifesup.ticketflow.integration.entity.ConnectionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ConnectionRepository extends JpaRepository<ConnectionEntity, Long> {

    String SEARCH_FROM = """
            from ConnectionEntity c
            join ExternalSystemEntity s on s.id = c.systemId
            where c.deleted = false
              and (:systemId is null or c.systemId = :systemId)
              and (:keyword is null or c.code like :keyword escape '\\' or c.name like :keyword escape '\\')
              and (:status is null or c.status = :status)
              and (:protocol is null or c.protocol = :protocol)
              and (:authType is null or c.authType = :authType)
            """;

    Optional<ConnectionEntity> findByIdAndDeletedFalse(Long id);

    boolean existsBySystemIdAndCodeAndDeletedFalse(Long systemId, String code);

    boolean existsBySystemIdAndDeletedFalse(Long systemId);

    long countBySystemIdAndDeletedFalse(Long systemId);

    /**
     * Danh sách connection chưa xoá kèm hệ thống chứa nó và số API chưa xoá.
     *
     * @param keyword chuỗi LIKE đã escape (QueryUtils.toLikePattern), null = không lọc
     */
    @Query(value = """
            select new com.lifesup.ticketflow.integration.dto.response.ConnectionSummaryResponse(
                c.id, c.code, c.name, c.protocol, c.baseUrl, c.authType, c.timeoutMs, c.status,
                s.id, s.code, s.name, s.status,
                (select count(o) from OperationEntity o where o.connectionId = c.id and o.deleted = false),
                c.updatedAt, c.updatedBy, c.rowVersion)
            """ + SEARCH_FROM,
            countQuery = "select count(c) " + SEARCH_FROM)
    Page<ConnectionSummaryResponse> search(
            @Param("systemId") Long systemId,
            @Param("keyword") String keyword,
            @Param("status") Status status,
            @Param("protocol") Protocol protocol,
            @Param("authType") AuthType authType,
            Pageable pageable);
}
