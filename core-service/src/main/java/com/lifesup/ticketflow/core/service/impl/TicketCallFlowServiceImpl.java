package com.lifesup.ticketflow.core.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowCreateRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowUpdateRequest;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse;
import com.lifesup.ticketflow.core.entity.TicketCallFlowEntity;
import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import com.lifesup.ticketflow.core.repository.TicketCallFlowRepository;
import com.lifesup.ticketflow.core.service.TicketCallFlowService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketCallFlowServiceImpl implements TicketCallFlowService {

    /** Giới hạn kích thước JSON canvas (ký tự), tránh request quá lớn làm nặng DB. */
    static final int MAX_FLOW_JSON_LENGTH = 5_000_000;

    TicketCallFlowRepository ticketCallFlowRepository;
    ObjectMapper objectMapper;

    @Override
    @Transactional
    public TicketCallFlowResponse create(TicketCallFlowCreateRequest request) {
        if (ticketCallFlowRepository.existsByCodeAndDeletedFalse(request.getCode())) {
            throw new AppException(ErrorCode.TICKET_CALL_FLOW_CODE_EXISTED);
        }

        TicketCallFlowEntity entity = new TicketCallFlowEntity();
        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setStatus(request.getStatus() != null ? request.getStatus() : TicketCallFlowStatus.DRAFT);
        entity.setFlowJson(validateFlowJson(request.getFlowJson()));

        try {
            entity = ticketCallFlowRepository.saveAndFlush(entity);
        } catch (DataIntegrityViolationException e) {
            // 2 request cùng tạo 1 mã: request sau vướng unique key uk_ticket_call_flow_active_code
            throw new AppException(ErrorCode.TICKET_CALL_FLOW_CODE_EXISTED, e);
        }
        log.info("Created ticket_call_flow id={} code={}", entity.getId(), entity.getCode());
        return toResponse(entity);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "ticket-call-flow", key = "#id")
    public TicketCallFlowResponse update(Long id, TicketCallFlowUpdateRequest request) {
        TicketCallFlowEntity entity = findActive(id);

        // Người khác đã lưu sau lần FE lấy dữ liệu: chặn để không ghi đè mất thay đổi của họ
        if (request.getRowVersion() != null && !Objects.equals(request.getRowVersion(), entity.getRowVersion())) {
            throw new AppException(ErrorCode.DATA_CONFLICT);
        }

        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            entity.setStatus(request.getStatus());
        }
        entity.setFlowJson(validateFlowJson(request.getFlowJson()));

        entity = ticketCallFlowRepository.saveAndFlush(entity);
        log.info("Updated ticket_call_flow id={} rowVersion={}", entity.getId(), entity.getRowVersion());
        return toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "ticket-call-flow", key = "#id", unless = "#result == null")
    public TicketCallFlowResponse getById(Long id) {
        return toResponse(findActive(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TicketCallFlowSummaryResponse> search(
            String keyword, TicketCallFlowStatus status, int page, int size) {
        PageRequest pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Order.desc("updatedAt"), Sort.Order.desc("id")));
        return new PageResponse<>(ticketCallFlowRepository.search(toLikePattern(keyword), status, pageable));
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "ticket-call-flow", key = "#id")
    public void delete(Long id) {
        TicketCallFlowEntity entity = findActive(id);
        entity.setDeleted(true);
        ticketCallFlowRepository.save(entity);
        log.info("Deleted ticket_call_flow id={} code={}", entity.getId(), entity.getCode());
    }

    private TicketCallFlowEntity findActive(Long id) {
        return ticketCallFlowRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_CALL_FLOW_NOT_FOUND));
    }

    /**
     * Kiểm tra chuỗi flowJson trước khi lưu, KHÔNG biến đổi nội dung (lưu và trả lại nguyên văn):
     * - không vượt quá giới hạn kích thước
     * - đúng cú pháp JSON (bảng có CHECK JSON_VALID, kiểm tra trước để trả lỗi rõ ràng thay vì lỗi ràng buộc DB)
     * Việc đọc JSON để chuyển sang BPMN/Flowable làm ở bước sau.
     */
    private String validateFlowJson(String flowJson) {
        if (flowJson.length() > MAX_FLOW_JSON_LENGTH) {
            throw new AppException(ErrorCode.FLOW_JSON_TOO_LARGE);
        }
        try {
            objectMapper.readTree(flowJson);
        } catch (JsonProcessingException e) {
            throw new AppException(ErrorCode.FLOW_JSON_INVALID, e);
        }
        return flowJson;
    }

    /** Từ khoá tìm kiếm thành mẫu LIKE, escape ký tự đặc biệt % _ \ để người dùng tìm đúng chữ. */
    private static String toLikePattern(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null;
        }
        String escaped = keyword.trim().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return "%" + escaped + "%";
    }

    private TicketCallFlowResponse toResponse(TicketCallFlowEntity entity) {
        return TicketCallFlowResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .flowJson(entity.getFlowJson())
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(entity.getUpdatedBy())
                .rowVersion(entity.getRowVersion())
                .build();
    }
}
