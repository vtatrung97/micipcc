package com.lifesup.ticketflow.core.repository;

import com.lifesup.ticketflow.core.entity.FormFieldEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface FormFieldRepository extends JpaRepository<FormFieldEntity, Long> {

    List<FormFieldEntity> findByFormIdInOrderByPositionAsc(Collection<Long> formIds);
}
