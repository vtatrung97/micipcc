package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.entity.UserAccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAccountRepository extends JpaRepository<UserAccountEntity, Long> {

    /** @return null nếu không có. */
    UserAccountEntity findByKeycloakId(String keycloakId);

    void deleteByKeycloakId(String keycloakId);
}
