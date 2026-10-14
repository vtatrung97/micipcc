package com.lifesup.ticketflow.core.service.impl;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.KeycloakGroupDto;
import com.lifesup.ticketflow.core.dto.request.KeycloakGroupSearchRequest;
import com.lifesup.ticketflow.core.dto.response.KeycloakGroupResponse;
import com.lifesup.ticketflow.core.entity.KeycloakGroupEntity;
import com.lifesup.ticketflow.core.repository.KeycloakGroupRepository;
import com.lifesup.ticketflow.core.service.KeycloakGroupService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import static com.lifesup.ticketflow.core.common.util.QueryUtils.toLikePattern;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KeycloakGroupServiceImpl implements KeycloakGroupService {

    /** status khi group bị xoá bên Keycloak (theo IPCC). */
    static final short STATUS_DELETED = 0;

    KeycloakGroupRepository keycloakGroupRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<KeycloakGroupResponse> search(KeycloakGroupSearchRequest request) {
        Sort sort = Sort.by(Sort.Order.asc("name"), Sort.Order.asc("id"));
        PageRequest pageable = PageRequest.of(request.getPage() - 1, request.getSize(), sort);
        String realmName = StringUtils.hasText(request.getRealmName()) ? request.getRealmName().trim() : null;
        return new PageResponse<>(keycloakGroupRepository.search(toLikePattern(request.getName()), realmName, pageable));
    }

    @Override
    @Transactional
    public void saveOrUpdate(KeycloakGroupDto dto, boolean isUpdate) {
        KeycloakGroupEntity entity = keycloakGroupRepository.findById(dto.getId()).orElseGet(KeycloakGroupEntity::new);
        updateEntityFromDto(entity, dto, isUpdate);
        keycloakGroupRepository.save(entity);
    }

    @Override
    @Transactional
    public void delete(KeycloakGroupDto dto) {
        // Giống IPCC: không xoá dòng, chỉ đặt status = 0
        keycloakGroupRepository.findById(dto.getId()).ifPresent(entity -> {
            entity.setStatus(STATUS_DELETED);
            keycloakGroupRepository.save(entity);
        });
    }

    /** Giống updateEntityFromDto của IPCC để dữ liệu CDC khớp dữ liệu import từ IPCC. */
    private static void updateEntityFromDto(KeycloakGroupEntity entity, KeycloakGroupDto dto, boolean isUpdate) {
        entity.setId(dto.getId());
        entity.setName(dto.getName());
        entity.setCreateTime(dto.getCreateTime());
        entity.setCreateBy(dto.getCreateBy());
        if (isUpdate) {
            entity.setUpdateTime(dto.getUpdateTime());
            entity.setUpdateBy(dto.getUpdateBy());
        }
        entity.setStatus(dto.getStatus());
        entity.setRealmName(dto.getRealmName());
        entity.setIsDeleting(dto.getIsDeleting());
        entity.setGroupSourceId(dto.getGroupSourceId());
        entity.setCode(dto.getCode());
        entity.setParentGroup(dto.getParentGroup());
        entity.setType(dto.getType());
        // Group cấp cao nhất (không có cha): group_source_id = id của chính nó
        if (!StringUtils.hasText(dto.getParentGroup())) {
            entity.setGroupSourceId(dto.getId());
        }
    }
}
