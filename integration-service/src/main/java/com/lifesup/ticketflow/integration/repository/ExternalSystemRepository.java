package com.lifesup.ticketflow.integration.repository;

import com.lifesup.ticketflow.integration.common.enums.Environment;
import com.lifesup.ticketflow.integration.common.enums.Status;
import com.lifesup.ticketflow.integration.dto.response.ExternalSystemResponse;
import com.lifesup.ticketflow.integration.entity.ExternalSystemEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ExternalSystemRepository extends JpaRepository<ExternalSystemEntity, Long> {

    String SEARCH_FILTER = """
            where s.deleted = false
              and (:keyword is null or s.code like :keyword escape '\\' or s.name like :keyword escape '\\')
              and (:status is null or s.status = :status)
              and (:environment is null or s.environment = :environment)
            """;

    Optional<ExternalSystemEntity> findByIdAndDeletedFalse(Long id);

    boolean existsByCodeAndDeletedFalse(String code);

    /**
     * Danh sách hệ thống chưa xoá kèm số connection chưa xoá.
     *
     * @param keyword chuỗi LIKE đã escape (QueryUtils.toLikePattern), null = không lọc
     */
    @Query(value = """
            select new com.lifesup.ticketflow.integration.dto.response.ExternalSystemResponse(
                s.id, s.code, s.name, s.environment, s.description, s.status,
                (select count(c) from ConnectionEntity c where c.systemId = s.id and c.deleted = false),
                s.createdAt, s.createdBy, s.updatedAt, s.updatedBy, s.rowVersion)
            from ExternalSystemEntity s
            """ + SEARCH_FILTER,
            countQuery = "select count(s) from ExternalSystemEntity s " + SEARCH_FILTER)
    Page<ExternalSystemResponse> search(
            @Param("keyword") String keyword,
            @Param("status") Status status,
            @Param("environment") Environment environment,
            Pageable pageable);
}
