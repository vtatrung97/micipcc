package com.lifesup.ticketflow.integration.repository;

import com.lifesup.ticketflow.integration.common.enums.HttpMethod;
import com.lifesup.ticketflow.integration.common.enums.OperationStatus;
import com.lifesup.ticketflow.integration.dto.response.OperationSummaryResponse;
import com.lifesup.ticketflow.integration.entity.OperationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OperationRepository extends JpaRepository<OperationEntity, Long> {

    /** Cột tóm tắt của API kèm kết nối và hệ thống, không đọc schema / mapping (có thể lớn). */
    String SUMMARY_SELECT = """
            select new com.lifesup.ticketflow.integration.dto.response.OperationSummaryResponse(
                o.id, o.code, o.versionNo, o.name, o.description, o.httpMethod, o.path, o.status,
                c.id, c.code, c.name, c.status,
                s.id, s.code, s.name, s.status,
                o.updatedAt, o.updatedBy, o.rowVersion)
            """;

    String JOIN_PARENTS = """
            from OperationEntity o
            join ConnectionEntity c on c.id = o.connectionId and c.deleted = false
            join ExternalSystemEntity s on s.id = c.systemId and s.deleted = false
            """;

    String SEARCH_FILTER = """
            where o.deleted = false
              and (:keyword is null or o.code like :keyword escape '\\' or o.name like :keyword escape '\\')
              and (:systemId is null or s.id = :systemId)
              and (:connectionId is null or o.connectionId = :connectionId)
              and (:status is null or o.status = :status)
              and (:httpMethod is null or o.httpMethod = :httpMethod)
            """;

    Optional<OperationEntity> findByIdAndDeletedFalse(Long id);

    /** Mã đã dùng trong kết nối (mọi version chưa xoá). */
    boolean existsByConnectionIdAndCodeAndDeletedFalse(Long connectionId, String code);

    boolean existsByConnectionIdAndCodeAndStatusAndDeletedFalse(Long connectionId, String code, OperationStatus status);

    boolean existsByConnectionIdAndDeletedFalse(Long connectionId);

    /** Số version lớn nhất của mã, tính cả bản đã xoá để không dùng lại số version cũ. */
    @Query("""
            select coalesce(max(o.versionNo), 0) from OperationEntity o
            where o.connectionId = :connectionId and o.code = :code
            """)
    int findMaxVersionNo(@Param("connectionId") Long connectionId, @Param("code") String code);

    /** @param keyword chuỗi LIKE đã escape (QueryUtils.toLikePattern), null = không lọc */
    @Query(value = SUMMARY_SELECT + JOIN_PARENTS + SEARCH_FILTER,
            countQuery = "select count(o) " + JOIN_PARENTS + SEARCH_FILTER)
    Page<OperationSummaryResponse> search(
            @Param("keyword") String keyword,
            @Param("systemId") Long systemId,
            @Param("connectionId") Long connectionId,
            @Param("status") OperationStatus status,
            @Param("httpMethod") HttpMethod httpMethod,
            Pageable pageable);

    /** API dùng được trong Flow: hệ thống, kết nối và API cùng ACTIVE; systemId null = mọi hệ thống. */
    @Query(SUMMARY_SELECT + JOIN_PARENTS + """
            where o.deleted = false
              and o.status = com.lifesup.ticketflow.integration.common.enums.OperationStatus.ACTIVE
              and c.status = com.lifesup.ticketflow.integration.common.enums.Status.ACTIVE
              and s.status = com.lifesup.ticketflow.integration.common.enums.Status.ACTIVE
              and (:keyword is null or o.code like :keyword escape '\\' or o.name like :keyword escape '\\')
              and (:systemId is null or s.id = :systemId)
            order by s.name, c.name, o.name, o.versionNo desc
            """)
    List<OperationSummaryResponse> findUsable(@Param("keyword") String keyword, @Param("systemId") Long systemId);

    /** Mọi version chưa xoá của một mã trong kết nối, mới nhất trước. */
    @Query(SUMMARY_SELECT + JOIN_PARENTS + """
            where o.deleted = false and o.connectionId = :connectionId and o.code = :code
            order by o.versionNo desc
            """)
    List<OperationSummaryResponse> findVersions(@Param("connectionId") Long connectionId, @Param("code") String code);
}
