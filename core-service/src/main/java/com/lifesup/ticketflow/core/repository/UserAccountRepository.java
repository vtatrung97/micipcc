package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.dto.response.AgentResponse;
import com.lifesup.ticketflow.core.entity.UserAccountEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserAccountRepository extends JpaRepository<UserAccountEntity, Long> {

    /** @return null nếu không có. */
    UserAccountEntity findByKeycloakId(String keycloakId);

    void deleteByKeycloakId(String keycloakId);

    /** @param username chuỗi LIKE đã escape, VD "%agent%"; null = không lọc */
    @Query(value = """
                    select new com.lifesup.ticketflow.core.dto.response.AgentResponse(
                        u.id, u.keycloakId, u.username, u.fullName, u.email, u.status,
                        u.kzUserId, u.kzAccountId, u.realm, u.groupId, u.managerUser)
                    from UserAccountEntity u
                    where (:username is null or u.username like :username escape '\\')
                    """,
            countQuery = """
                    select count(u) from UserAccountEntity u
                    where (:username is null or u.username like :username escape '\\')
                    """)
    Page<AgentResponse> search(@Param("username") String username, Pageable pageable);
}
