package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.entity.FormEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FormRepository extends JpaRepository<FormEntity, Long> {

    boolean existsByIdAndDeletedFalse(Long id);

    /** @param keyword chuỗi LIKE đã escape, so với mã / tên / tiêu đề; null = không lọc */
    @Query("""
            select f from FormEntity f
            where f.deleted = false
              and (:keyword is null
                   or f.code like :keyword escape '\\'
                   or f.name like :keyword escape '\\'
                   or f.title like :keyword escape '\\')
            """)
    Page<FormEntity> search(@Param("keyword") String keyword, Pageable pageable);
}
