package com.lifesup.ticketflow.integration.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.lifesup.ticketflow.auth.util.SecurityContextUtils;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import com.lifesup.ticketflow.integration.common.enums.OperationStatus;
import com.lifesup.ticketflow.integration.common.enums.Status;
import com.lifesup.ticketflow.integration.common.exception.IntegrationErrorCode;
import com.lifesup.ticketflow.integration.common.utils.JsonHelper;
import com.lifesup.ticketflow.integration.common.utils.QueryUtils;
import com.lifesup.ticketflow.integration.dto.data.RetryPolicyData;
import com.lifesup.ticketflow.integration.dto.request.OperationCreateRequest;
import com.lifesup.ticketflow.integration.dto.request.OperationDefinition;
import com.lifesup.ticketflow.integration.dto.request.OperationInputParam;
import com.lifesup.ticketflow.integration.dto.request.OperationOutputParam;
import com.lifesup.ticketflow.integration.dto.request.OperationSearchRequest;
import com.lifesup.ticketflow.integration.dto.request.OperationUpdateRequest;
import com.lifesup.ticketflow.integration.dto.response.OperationResponse;
import com.lifesup.ticketflow.integration.dto.response.OperationSummaryResponse;
import com.lifesup.ticketflow.integration.entity.ConnectionEntity;
import com.lifesup.ticketflow.integration.entity.ExternalSystemEntity;
import com.lifesup.ticketflow.integration.entity.OperationEntity;
import com.lifesup.ticketflow.integration.repository.ConnectionRepository;
import com.lifesup.ticketflow.integration.repository.ExternalSystemRepository;
import com.lifesup.ticketflow.integration.repository.OperationRepository;
import com.lifesup.ticketflow.integration.service.OperationService;
import com.lifesup.ticketflow.integration.validation.OperationConfigValidator;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * API (operation) có version. Action bên core-service trỏ tới operation.id cụ thể nên bản đã ACTIVE không sửa được:
 * <ul>
 *   <li>Tạo mới: bản nháp DRAFT version 1 (mã từng bị xoá thì đánh số tiếp).</li>
 *   <li>Chỉ sửa / xoá được bản DRAFT. Muốn đổi bản đã ACTIVE thì tạo version mới (copy thành DRAFT).</li>
 *   <li>Mỗi mã tối đa 1 bản DRAFT; nhiều version ACTIVE cùng lúc là hợp lệ (Flow cũ dùng v1, Flow mới dùng v2).</li>
 *   <li>Số version mới = lớn nhất (kể cả bản đã xoá) + 1, không dùng lại số cũ.</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OperationServiceImpl implements OperationService {

    static final Sort DEFAULT_SORT = Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.desc("id"));
    static final TypeReference<List<OperationInputParam>> INPUT_PARAMS_TYPE = new TypeReference<>() {};
    static final TypeReference<List<OperationOutputParam>> OUTPUT_PARAMS_TYPE = new TypeReference<>() {};
    static final TypeReference<Map<String, String>> STRING_MAP_TYPE = new TypeReference<>() {};

    OperationRepository operationRepository;
    ConnectionRepository connectionRepository;
    ExternalSystemRepository externalSystemRepository;
    OperationConfigValidator validator;
    JsonHelper jsonHelper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OperationSummaryResponse> search(OperationSearchRequest request) {
        PageRequest pageable = PageRequest.of(request.getPage() - 1, request.getSize(), DEFAULT_SORT);
        return new PageResponse<>(operationRepository.search(
                QueryUtils.toLikePattern(request.getKeyword()), request.getSystemId(), request.getConnectionId(),
                request.getStatus(), request.getHttpMethod(), pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OperationSummaryResponse> findUsable(String keyword, Long systemId) {
        return operationRepository.findUsable(QueryUtils.toLikePattern(keyword), systemId);
    }

    @Override
    @Transactional(readOnly = true)
    public OperationResponse getById(Long id) {
        return toResponse(findActive(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OperationSummaryResponse> getVersions(Long id) {
        OperationEntity entity = findActive(id);
        return operationRepository.findVersions(entity.getConnectionId(), entity.getCode());
    }

    @Override
    @Transactional
    public OperationResponse create(OperationCreateRequest request) {
        ConnectionEntity connection = findConnection(request.getConnectionId());
        if (operationRepository.existsByConnectionIdAndCodeAndDeletedFalse(connection.getId(), request.getCode())) {
            throw new AppException(IntegrationErrorCode.OPERATION_CODE_EXISTED);
        }
        validator.validate(request);

        OperationEntity entity = new OperationEntity();
        entity.setConnectionId(connection.getId());
        entity.setCode(request.getCode());
        // Mã từng có bản đã xoá thì đánh số tiếp, không dùng lại số version cũ
        entity.setVersionNo(operationRepository.findMaxVersionNo(connection.getId(), request.getCode()) + 1);
        entity.setStatus(OperationStatus.DRAFT);
        entity.setRealm(SecurityContextUtils.getRealm());
        applyDefinition(entity, request);

        entity = operationRepository.saveAndFlush(entity);
        log.info("Created operation id={} code={} connectionId={}", entity.getId(), entity.getCode(), connection.getId());
        return toResponse(entity);
    }

    @Override
    @Transactional
    public OperationResponse update(Long id, OperationUpdateRequest request) {
        OperationEntity entity = findActive(id);
        if (entity.getStatus() != OperationStatus.DRAFT) {
            throw new AppException(IntegrationErrorCode.OPERATION_NOT_EDITABLE);
        }
        checkRowVersion(entity.getRowVersion(), request.getRowVersion());
        validator.validate(request);
        applyDefinition(entity, request);

        entity = operationRepository.saveAndFlush(entity);
        log.info("Updated operation id={} code={} versionNo={}", entity.getId(), entity.getCode(), entity.getVersionNo());
        return toResponse(entity);
    }

    @Override
    @Transactional
    public OperationResponse createNewVersion(Long id) {
        OperationEntity source = findActive(id);
        if (operationRepository.existsByConnectionIdAndCodeAndStatusAndDeletedFalse(
                source.getConnectionId(), source.getCode(), OperationStatus.DRAFT)) {
            throw new AppException(IntegrationErrorCode.OPERATION_DRAFT_EXISTED);
        }

        OperationEntity draft = new OperationEntity();
        draft.setConnectionId(source.getConnectionId());
        draft.setCode(source.getCode());
        draft.setVersionNo(operationRepository.findMaxVersionNo(source.getConnectionId(), source.getCode()) + 1);
        draft.setStatus(OperationStatus.DRAFT);
        draft.setRealm(SecurityContextUtils.getRealm());
        copyDefinition(source, draft);

        draft = operationRepository.saveAndFlush(draft);
        log.info("Created operation version id={} code={} versionNo={} from id={}",
                draft.getId(), draft.getCode(), draft.getVersionNo(), source.getId());
        return toResponse(draft);
    }

    @Override
    @Transactional
    public OperationResponse activate(Long id, Long rowVersion) {
        OperationEntity entity = findActive(id);
        checkRowVersion(entity.getRowVersion(), rowVersion);
        if (entity.getStatus() == OperationStatus.ACTIVE) {
            throw transitionInvalid(entity.getStatus(), OperationStatus.ACTIVE);
        }
        ConnectionEntity connection = findConnection(entity.getConnectionId());
        if (connection.getStatus() != Status.ACTIVE) {
            throw new AppException(IntegrationErrorCode.CONNECTION_INACTIVE);
        }
        if (findSystem(connection.getSystemId()).getStatus() != Status.ACTIVE) {
            throw new AppException(IntegrationErrorCode.EXTERNAL_SYSTEM_INACTIVE);
        }
        return changeStatus(entity, OperationStatus.ACTIVE);
    }

    @Override
    @Transactional
    public OperationResponse deactivate(Long id, Long rowVersion) {
        OperationEntity entity = findActive(id);
        checkRowVersion(entity.getRowVersion(), rowVersion);
        if (entity.getStatus() != OperationStatus.ACTIVE) {
            throw transitionInvalid(entity.getStatus(), OperationStatus.INACTIVE);
        }
        return changeStatus(entity, OperationStatus.INACTIVE);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        OperationEntity entity = findActive(id);
        if (entity.getStatus() != OperationStatus.DRAFT) {
            throw new AppException(IntegrationErrorCode.OPERATION_NOT_DELETABLE);
        }
        entity.setDeleted(true);
        operationRepository.save(entity);
        log.info("Deleted operation id={} code={} versionNo={}", entity.getId(), entity.getCode(), entity.getVersionNo());
    }

    private OperationResponse changeStatus(OperationEntity entity, OperationStatus status) {
        OperationStatus from = entity.getStatus();
        entity.setStatus(status);
        entity = operationRepository.saveAndFlush(entity);
        log.info("Changed operation id={} status {} -> {}", entity.getId(), from, status);
        return toResponse(entity);
    }

    /** Gán phần định nghĩa API (đã kiểm tra hợp lệ) từ request tạo / sửa. */
    private void applyDefinition(OperationEntity entity, OperationDefinition definition) {
        entity.setName(definition.getName());
        entity.setDescription(definition.getDescription());
        entity.setHttpMethod(definition.getHttpMethod());
        entity.setPath(definition.getPath());
        entity.setHeaders(jsonHelper.write(definition.getHeaders()));
        entity.setQueryParams(jsonHelper.write(definition.getQueryParams()));
        entity.setInputParams(jsonHelper.write(definition.getInputParams()));
        entity.setOutputParams(jsonHelper.write(definition.getOutputParams()));
        entity.setRequestSchema(jsonHelper.write(definition.getRequestSchema()));
        entity.setResponseSchema(jsonHelper.write(definition.getResponseSchema()));
        entity.setRequestMapping(blankToNull(definition.getRequestMapping()));
        entity.setResponseMapping(blankToNull(definition.getResponseMapping()));
        entity.setTimeoutMs(definition.getTimeoutMs());
        entity.setRetryPolicy(jsonHelper.write(definition.getRetryPolicy()));
    }

    /** Copy định nghĩa sang bản version mới, giữ nguyên chuỗi JSON đã lưu. */
    private static void copyDefinition(OperationEntity source, OperationEntity target) {
        target.setName(source.getName());
        target.setDescription(source.getDescription());
        target.setHttpMethod(source.getHttpMethod());
        target.setPath(source.getPath());
        target.setHeaders(source.getHeaders());
        target.setQueryParams(source.getQueryParams());
        target.setInputParams(source.getInputParams());
        target.setOutputParams(source.getOutputParams());
        target.setRequestSchema(source.getRequestSchema());
        target.setResponseSchema(source.getResponseSchema());
        target.setRequestMapping(source.getRequestMapping());
        target.setResponseMapping(source.getResponseMapping());
        target.setTimeoutMs(source.getTimeoutMs());
        target.setRetryPolicy(source.getRetryPolicy());
    }

    /** Danh sách lưu dạng JSON, chưa khai báo thì trả rỗng. */
    private <T> List<T> readList(String json, TypeReference<List<T>> type) {
        List<T> values = jsonHelper.read(json, type);
        return values != null ? values : List.of();
    }

    private static String blankToNull(String value) {
        return StringUtils.hasText(value) ? value : null;
    }

    private static AppException transitionInvalid(OperationStatus from, OperationStatus to) {
        return AppException.withArgs(IntegrationErrorCode.OPERATION_STATUS_TRANSITION_INVALID, from, to);
    }

    private OperationEntity findActive(Long id) {
        return operationRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(IntegrationErrorCode.OPERATION_NOT_FOUND));
    }

    private ConnectionEntity findConnection(Long connectionId) {
        return connectionRepository.findByIdAndDeletedFalse(connectionId)
                .orElseThrow(() -> new AppException(IntegrationErrorCode.CONNECTION_NOT_FOUND));
    }

    private ExternalSystemEntity findSystem(Long systemId) {
        return externalSystemRepository.findByIdAndDeletedFalse(systemId)
                .orElseThrow(() -> new AppException(IntegrationErrorCode.EXTERNAL_SYSTEM_NOT_FOUND));
    }

    private OperationResponse toResponse(OperationEntity entity) {
        ConnectionEntity connection = findConnection(entity.getConnectionId());
        ExternalSystemEntity system = findSystem(connection.getSystemId());
        return OperationResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .versionNo(entity.getVersionNo())
                .name(entity.getName())
                .description(entity.getDescription())
                .httpMethod(entity.getHttpMethod())
                .path(entity.getPath())
                .headers(jsonHelper.read(entity.getHeaders(), STRING_MAP_TYPE))
                .queryParams(jsonHelper.read(entity.getQueryParams(), STRING_MAP_TYPE))
                .inputParams(readList(entity.getInputParams(), INPUT_PARAMS_TYPE))
                .outputParams(readList(entity.getOutputParams(), OUTPUT_PARAMS_TYPE))
                .requestSchema(jsonHelper.read(entity.getRequestSchema()))
                .responseSchema(jsonHelper.read(entity.getResponseSchema()))
                .requestMapping(entity.getRequestMapping())
                .responseMapping(entity.getResponseMapping())
                .timeoutMs(entity.getTimeoutMs())
                .retryPolicy(jsonHelper.read(entity.getRetryPolicy(), RetryPolicyData.class))
                .status(entity.getStatus())
                .connectionId(connection.getId())
                .connectionCode(connection.getCode())
                .connectionName(connection.getName())
                .connectionStatus(connection.getStatus())
                .systemId(system.getId())
                .systemCode(system.getCode())
                .systemName(system.getName())
                .systemStatus(system.getStatus())
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
