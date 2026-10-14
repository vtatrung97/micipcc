package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.dto.response.KeycloakGroupResponse;
import com.lifesup.ticketflow.core.entity.KeycloakGroupEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface KeycloakGroupRepository extends JpaRepository<KeycloakGroupEntity, String> {

    /**
     * Tìm group theo tên (tương đối) và realm, bỏ group đã xoá (status = 0).
     *
     * @param name chuỗi LIKE đã escape, VD "%khieu nai%"; null = không lọc
     * @param realmName null = mọi realm
     */
    @Query(value = """
                    select new com.lifesup.ticketflow.core.dto.response.KeycloakGroupResponse(
                        g.id, g.name, g.parentGroup, g.type, g.code, g.groupSourceId, g.status, g.isDeleting, g.realmName)
                    from KeycloakGroupEntity g
                    where (:realmName is null or g.realmName = :realmName)
                      and (g.status is null or g.status <> 0)
                      and (:name is null or g.name like :name escape '\\')
                    """,
            countQuery = """
                    select count(g) from KeycloakGroupEntity g
                    where (:realmName is null or g.realmName = :realmName)
                      and (g.status is null or g.status <> 0)
                      and (:name is null or g.name like :name escape '\\')
                    """)
    Page<KeycloakGroupResponse> search(
            @Param("name") String name,
            @Param("realmName") String realmName,
            Pageable pageable);
}
