package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.entity.AppParamEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppParamRepository extends JpaRepository<AppParamEntity, Long> {

    boolean existsByTypeAndCode(String type, String code);

    /** @param name chuỗi LIKE đã escape, VD "%khieu nai%"; null = không lọc */
    @Query("""
            select p from AppParamEntity p
            where p.type = :type
              and (:name is null or p.name like :name escape '\\')
            """)
    Page<AppParamEntity> search(@Param("type") String type, @Param("name") String name, Pageable pageable);
}
