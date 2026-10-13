package com.lifesup.ticketflow.integration.service.impl;

import com.lifesup.ticketflow.auth.util.SecurityContextUtils;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import com.lifesup.ticketflow.integration.common.enums.Status;
import com.lifesup.ticketflow.integration.common.exception.IntegrationErrorCode;
import com.lifesup.ticketflow.integration.common.utils.QueryUtils;
import com.lifesup.ticketflow.integration.dto.request.ExternalSystemCreateRequest;
import com.lifesup.ticketflow.integration.dto.request.ExternalSystemSearchRequest;
import com.lifesup.ticketflow.integration.dto.request.ExternalSystemUpdateRequest;
import com.lifesup.ticketflow.integration.dto.response.ExternalSystemResponse;
import com.lifesup.ticketflow.integration.entity.ExternalSystemEntity;
import com.lifesup.ticketflow.integration.repository.ConnectionRepository;
import com.lifesup.ticketflow.integration.repository.ExternalSystemRepository;
import com.lifesup.ticketflow.integration.service.ExternalSystemService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

/**
 * Hệ thống thứ 3. Đổi trạng thái không cascade xuống connection / API (API chỉ dùng được khi hệ thống, kết nối và API cùng ACTIVE);
 * xoá mềm và chỉ xoá được khi không còn connection.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ExternalSystemServiceImpl implements ExternalSystemService {

    static final Sort DEFAULT_SORT = Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.desc("id"));

    ExternalSystemRepository externalSystemRepository;
    ConnectionRepository connectionRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ExternalSystemResponse> search(ExternalSystemSearchRequest request) {
        PageRequest pageable = PageRequest.of(request.getPage() - 1, request.getSize(), DEFAULT_SORT);
        return new PageResponse<>(externalSystemRepository.search(
                QueryUtils.toLikePattern(request.getKeyword()), request.getStatus(), request.getEnvironment(), pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public ExternalSystemResponse getById(Long id) {
        return toResponse(findActive(id));
    }

    @Override
    @Transactional
    public ExternalSystemResponse create(ExternalSystemCreateRequest request) {
        if (externalSystemRepository.existsByCodeAndDeletedFalse(request.getCode())) {
            throw new AppException(IntegrationErrorCode.EXTERNAL_SYSTEM_CODE_EXISTED);
        }
        ExternalSystemEntity entity = new ExternalSystemEntity();
        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setEnvironment(request.getEnvironment());
        entity.setDescription(request.getDescription());
        entity.setStatus(request.getStatus() != null ? request.getStatus() : Status.ACTIVE);
        entity.setRealm(SecurityContextUtils.getRealm());

        entity = externalSystemRepository.saveAndFlush(entity);
        log.info("Created external system id={} code={}", entity.getId(), entity.getCode());
        return toResponse(entity);
    }

    @Override
    @Transactional
    public ExternalSystemResponse update(Long id, ExternalSystemUpdateRequest request) {
        ExternalSystemEntity entity = findActive(id);
        checkRowVersion(entity.getRowVersion(), request.getRowVersion());

        entity.setName(request.getName());
        entity.setEnvironment(request.getEnvironment());
        entity.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }

        entity = externalSystemRepository.saveAndFlush(entity);
        log.info("Updated external system id={} status={}", entity.getId(), entity.getStatus());
        return toResponse(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ExternalSystemEntity entity = findActive(id);
        if (connectionRepository.existsBySystemIdAndDeletedFalse(id)) {
            throw new AppException(IntegrationErrorCode.EXTERNAL_SYSTEM_HAS_CONNECTIONS);
        }
        entity.setDeleted(true);
        externalSystemRepository.save(entity);
        log.info("Deleted external system id={} code={}", entity.getId(), entity.getCode());
    }

    private ExternalSystemEntity findActive(Long id) {
        return externalSystemRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(IntegrationErrorCode.EXTERNAL_SYSTEM_NOT_FOUND));
    }

    private ExternalSystemResponse toResponse(ExternalSystemEntity entity) {
        return ExternalSystemResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .environment(entity.getEnvironment())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .connectionCount(connectionRepository.countBySystemIdAndDeletedFalse(entity.getId()))
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(entity.getUpdatedBy())
                .rowVersion(entity.getRowVersion())
                .build();
    }

    /** Người khác đã sửa sau lần FE lấy dữ liệu: chặn để không ghi đè mất thay đổi của họ. rowVersion null = không kiểm tra. */
    private static void checkRowVersion(Long current, Long requested) {
        if (requested != null && !Objects.equals(current, requested)) {
            throw new AppException(ErrorCode.DATA_CONFLICT);
        }
    }
}
