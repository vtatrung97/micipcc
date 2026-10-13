package com.lifesup.ticketflow.integration.service.impl;

import com.lifesup.ticketflow.auth.util.SecurityContextUtils;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import com.lifesup.ticketflow.integration.common.enums.AuthType;
import com.lifesup.ticketflow.integration.common.enums.Protocol;
import com.lifesup.ticketflow.integration.common.enums.Status;
import com.lifesup.ticketflow.integration.common.exception.IntegrationErrorCode;
import com.lifesup.ticketflow.integration.common.utils.CredentialCipher;
import com.lifesup.ticketflow.integration.common.utils.JsonHelper;
import com.lifesup.ticketflow.integration.common.utils.QueryUtils;
import com.lifesup.ticketflow.integration.dto.data.AuthConfigData;
import com.lifesup.ticketflow.integration.dto.data.CircuitBreakerConfigData;
import com.lifesup.ticketflow.integration.dto.data.SecretData;
import com.lifesup.ticketflow.integration.dto.request.ConnectionCreateRequest;
import com.lifesup.ticketflow.integration.dto.request.ConnectionDefinition;
import com.lifesup.ticketflow.integration.dto.request.ConnectionSearchRequest;
import com.lifesup.ticketflow.integration.dto.request.ConnectionUpdateRequest;
import com.lifesup.ticketflow.integration.dto.response.ConnectionResponse;
import com.lifesup.ticketflow.integration.dto.response.ConnectionSummaryResponse;
import com.lifesup.ticketflow.integration.entity.ConnectionCredentialEntity;
import com.lifesup.ticketflow.integration.entity.ConnectionEntity;
import com.lifesup.ticketflow.integration.entity.ExternalSystemEntity;
import com.lifesup.ticketflow.integration.repository.ConnectionCredentialRepository;
import com.lifesup.ticketflow.integration.repository.ConnectionRepository;
import com.lifesup.ticketflow.integration.repository.ExternalSystemRepository;
import com.lifesup.ticketflow.integration.repository.OperationRepository;
import com.lifesup.ticketflow.integration.service.ConnectionService;
import com.lifesup.ticketflow.integration.validation.ConnectionConfigValidator;
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
 * Kết nối tới hệ thống thứ 3. Secret (API key, password, token, client secret) lưu mã hoá ở connection_credential,
 * chỉ ghi: response chỉ cho biết đã có secret hay chưa. Xoá mềm, chỉ xoá được khi không còn API; xoá thì xoá hẳn secret.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConnectionServiceImpl implements ConnectionService {

    static final Sort DEFAULT_SORT = Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.desc("id"));
    static final int DEFAULT_TIMEOUT_MS = 5000;

    ConnectionRepository connectionRepository;
    ConnectionCredentialRepository credentialRepository;
    ExternalSystemRepository externalSystemRepository;
    OperationRepository operationRepository;
    ConnectionConfigValidator validator;
    CredentialCipher credentialCipher;
    JsonHelper jsonHelper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ConnectionSummaryResponse> search(ConnectionSearchRequest request) {
        PageRequest pageable = PageRequest.of(request.getPage() - 1, request.getSize(), DEFAULT_SORT);
        return new PageResponse<>(connectionRepository.search(
                request.getSystemId(), QueryUtils.toLikePattern(request.getKeyword()), request.getStatus(),
                request.getProtocol(), request.getAuthType(), pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public ConnectionResponse getById(Long id) {
        ConnectionEntity entity = findActive(id);
        return toResponse(entity, findSystem(entity.getSystemId()));
    }

    @Override
    @Transactional
    public ConnectionResponse create(ConnectionCreateRequest request) {
        ExternalSystemEntity system = findSystem(request.getSystemId());
        if (connectionRepository.existsBySystemIdAndCodeAndDeletedFalse(system.getId(), request.getCode())) {
            throw new AppException(IntegrationErrorCode.CONNECTION_CODE_EXISTED);
        }
        AuthType authType = request.getAuthType() != null ? request.getAuthType() : AuthType.NONE;
        validator.validateSecret(authType, request.getSecret());

        ConnectionEntity entity = new ConnectionEntity();
        entity.setSystemId(system.getId());
        entity.setCode(request.getCode());
        entity.setStatus(request.getStatus() != null ? request.getStatus() : Status.ACTIVE);
        entity.setRealm(SecurityContextUtils.getRealm());
        applyDefinition(entity, request, authType);

        entity = connectionRepository.saveAndFlush(entity);
        // Mã hoá sau khi có id vì id là AAD của ciphertext
        if (authType != AuthType.NONE) {
            saveSecret(entity.getId(), request.getSecret());
        }
        log.info("Created connection id={} code={} systemId={} authType={}",
                entity.getId(), entity.getCode(), entity.getSystemId(), authType);
        return toResponse(entity, system);
    }

    @Override
    @Transactional
    public ConnectionResponse update(Long id, ConnectionUpdateRequest request) {
        ConnectionEntity entity = findActive(id);
        checkRowVersion(entity.getRowVersion(), request.getRowVersion());
        AuthType authType = request.getAuthType();
        boolean authTypeChanged = entity.getAuthType() != authType;

        // Không gửi secret thì giữ secret cũ, trừ khi đổi loại xác thực (secret cũ không còn đúng loại) hoặc chưa từng có
        boolean keepOldSecret = request.getSecret() == null && !authTypeChanged
                && credentialRepository.existsByConnectionId(id);
        if (!keepOldSecret) {
            validator.validateSecret(authType, request.getSecret());
        }

        applyDefinition(entity, request, authType);
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        entity = connectionRepository.saveAndFlush(entity);

        if (authType == AuthType.NONE) {
            credentialRepository.deleteByConnectionId(id);
        } else if (!keepOldSecret) {
            saveSecret(id, request.getSecret());
        }
        log.info("Updated connection id={} authType={} secretChanged={}", id, authType, !keepOldSecret);
        return toResponse(entity, findSystem(entity.getSystemId()));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ConnectionEntity entity = findActive(id);
        if (operationRepository.existsByConnectionIdAndDeletedFalse(id)) {
            throw new AppException(IntegrationErrorCode.CONNECTION_HAS_OPERATIONS);
        }
        // Kết nối đã xoá không gọi được nữa nên không giữ secret
        credentialRepository.deleteByConnectionId(id);
        entity.setDeleted(true);
        connectionRepository.save(entity);
        log.info("Deleted connection id={} code={}", entity.getId(), entity.getCode());
    }

    /** Gán phần cấu hình chung của request tạo / sửa sau khi kiểm tra hợp lệ. */
    private void applyDefinition(ConnectionEntity entity, ConnectionDefinition definition, AuthType authType) {
        validator.validateAuthConfig(authType, definition.getAuthConfig());

        entity.setName(definition.getName());
        entity.setProtocol(definition.getProtocol() != null ? definition.getProtocol() : Protocol.REST);
        entity.setBaseUrl(validator.normalizeBaseUrl(definition.getBaseUrl()));
        entity.setAuthType(authType);
        entity.setAuthConfig(jsonHelper.write(definition.getAuthConfig()));
        entity.setTimeoutMs(definition.getTimeoutMs() != null ? definition.getTimeoutMs() : DEFAULT_TIMEOUT_MS);
        entity.setRateLimitPerSecond(definition.getRateLimitPerSecond());
        entity.setCircuitBreakerConfig(jsonHelper.write(definition.getCircuitBreakerConfig()));
    }

    private void saveSecret(Long connectionId, SecretData secret) {
        String ciphertext = credentialCipher.encrypt(connectionId, jsonHelper.writeValue(secret));
        ConnectionCredentialEntity credential = credentialRepository.findByConnectionId(connectionId)
                .orElseGet(() -> {
                    ConnectionCredentialEntity created = new ConnectionCredentialEntity();
                    created.setConnectionId(connectionId);
                    return created;
                });
        credential.setSecretCiphertext(ciphertext);
        credential.setKeyVersion(CredentialCipher.KEY_VERSION);
        credentialRepository.save(credential);
    }

    private ConnectionEntity findActive(Long id) {
        return connectionRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(IntegrationErrorCode.CONNECTION_NOT_FOUND));
    }

    private ExternalSystemEntity findSystem(Long systemId) {
        return externalSystemRepository.findByIdAndDeletedFalse(systemId)
                .orElseThrow(() -> new AppException(IntegrationErrorCode.EXTERNAL_SYSTEM_NOT_FOUND));
    }

    private ConnectionResponse toResponse(ConnectionEntity entity, ExternalSystemEntity system) {
        ConnectionCredentialEntity credential = credentialRepository.findByConnectionId(entity.getId()).orElse(null);
        return ConnectionResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .protocol(entity.getProtocol())
                .baseUrl(entity.getBaseUrl())
                .authType(entity.getAuthType())
                .authConfig(jsonHelper.read(entity.getAuthConfig(), AuthConfigData.class))
                .hasSecret(credential != null)
                .secretUpdatedAt(credential == null ? null
                        : credential.getUpdatedAt() != null ? credential.getUpdatedAt() : credential.getCreatedAt())
                .timeoutMs(entity.getTimeoutMs())
                .rateLimitPerSecond(entity.getRateLimitPerSecond())
                .circuitBreakerConfig(jsonHelper.read(entity.getCircuitBreakerConfig(), CircuitBreakerConfigData.class))
                .status(entity.getStatus())
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
