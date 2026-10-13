package com.lifesup.ticketflow.integration.repository;

import com.lifesup.ticketflow.integration.entity.ConnectionCredentialEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConnectionCredentialRepository extends JpaRepository<ConnectionCredentialEntity, Long> {

    Optional<ConnectionCredentialEntity> findByConnectionId(Long connectionId);

    boolean existsByConnectionId(Long connectionId);

    void deleteByConnectionId(Long connectionId);
}
