package com.lifesup.ticketflow.core.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.core.common.enums.ScheduleType;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowStatus;
import com.lifesup.ticketflow.core.common.enums.TriggerType;
import com.lifesup.ticketflow.core.common.enums.TicketCallFlowVersionStatus;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowCloneRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowCreateRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowPublishRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowSearchRequest;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowTriggerDto;
import com.lifesup.ticketflow.core.dto.request.TicketCallFlowUpdateRequest;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowStatsResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowSummaryResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionResponse;
import com.lifesup.ticketflow.core.dto.response.TicketCallFlowVersionSummaryResponse;
import com.lifesup.ticketflow.core.entity.TemplateEntity;
import com.lifesup.ticketflow.core.entity.TemplateVersionEntity;
import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import com.lifesup.ticketflow.core.repository.TemplateRepository;
import com.lifesup.ticketflow.core.repository.TemplateVersionRepository;
import com.lifesup.ticketflow.core.service.TicketCallFlowService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.JpaSort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Quy trình gồm thông tin chung (template) và các phiên bản canvas (template_version):
 * - Tạo mới: phiên bản 1 ở trạng thái DRAFT, quy trình ở trạng thái DRAFT.
 * - Lưu canvas: ghi vào bản nháp; chưa có bản nháp thì tạo bản nháp mới với số phiên bản kế tiếp.
 * - Publish: bản nháp thành PUBLISHED, bản PUBLISHED cũ thành ARCHIVED; quy trình DRAFT chuyển sang ACTIVE.
 * Mọi thao tác ghi đều tăng rowVersion của quy trình để FE dùng một giá trị chống lưu đè duy nhất.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketCallFlowServiceImpl implements TicketCallFlowService {

    /** Giới hạn kích thước JSON canvas (ký tự), tránh request quá lớn làm nặng DB. */
    static final int MAX_FLOW_JSON_LENGTH = 5_000_000;

    /** Field sắp xếp (tên field trong TicketCallFlowSummaryResponse) → biểu thức JPQL trong TemplateRepository.search. */
    static final Map<String, String> SORT_FIELDS = Map.ofEntries(
            Map.entry("id", "t.id"),
            Map.entry("code", "t.code"),
            Map.entry("name", "t.name"),
            Map.entry("caseCodePrefix", "t.caseCodePrefix"),
            Map.entry("category", "t.category"),
            Map.entry("description", "t.description"),
            Map.entry("status", "t.status"),
            Map.entry("triggerType", "t.triggerType"),
            Map.entry("slaValue", "t.slaValue"),
            Map.entry("slaUnit", "t.slaUnit"),
            Map.entry("publishedVersionNo", "p.versionNo"),
            Map.entry("publishedAt", "p.publishedAt"),
            Map.entry("draftVersionNo", "d.versionNo"),
            Map.entry("draftUpdatedAt", "d.updatedAt"),
            Map.entry("draftUpdatedBy", "d.updatedBy"),
            Map.entry("createdAt", "t.createdAt"),
            Map.entry("createdBy", "t.createdBy"),
            Map.entry("updatedAt", "t.updatedAt"),
            Map.entry("updatedBy", "t.updatedBy"),
            Map.entry("rowVersion", "t.rowVersion"));

    TemplateRepository templateRepository;
    TemplateVersionRepository templateVersionRepository;
    ObjectMapper objectMapper;
    AuditorAware<String> auditorAware;

    @Override
    @Transactional
    public TicketCallFlowResponse create(TicketCallFlowCreateRequest request) {
        // Chưa có phiên bản hiệu lực nên chỉ có thể là DRAFT
        if (request.getStatus() != null && request.getStatus() != TicketCallFlowStatus.DRAFT) {
            throw new AppException(ErrorCode.TICKET_CALL_FLOW_STATUS_INVALID);
        }

        TemplateEntity entity = new TemplateEntity();
        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setCaseCodePrefix(request.getCaseCodePrefix());
        entity.setCategory(request.getCategory());
        entity.setDescription(request.getDescription());
        entity.setStatus(TicketCallFlowStatus.DRAFT);
        applyTrigger(entity, request.getTrigger());
        entity.setSlaValue(request.getSlaValue());
        entity.setSlaUnit(request.getSlaUnit());

        entity = insertWithUniqueCode(entity, validateFlowJson(request.getFlowJson()));
        log.info("Created template id={} code={}", entity.getId(), entity.getCode());
        return toResponse(entity);
    }

    @Override
    @Transactional
    public TicketCallFlowResponse clone(Long sourceId, TicketCallFlowCloneRequest request) {
        TemplateEntity source = findActive(sourceId);
        // Sao chép nội dung mới nhất: bản nháp nếu có, không thì bản đang hiệu lực
        TemplateVersionEntity sourceVersion = findEditingVersion(source.getId());

        TemplateEntity entity = new TemplateEntity();
        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setCaseCodePrefix(request.getCaseCodePrefix());
        entity.setDescription(request.getDescription() != null ? request.getDescription() : source.getDescription());
        // Bản sao luôn là bản nháp, người dùng chỉnh xong mới publish
        entity.setStatus(TicketCallFlowStatus.DRAFT);
        entity.setCategory(source.getCategory());
        entity.setTriggerType(source.getTriggerType());
        entity.setInputFormId(source.getInputFormId());
        entity.setTriggerApiId(source.getTriggerApiId());
        entity.setScheduleType(source.getScheduleType());
        entity.setScheduleRunDate(source.getScheduleRunDate());
        entity.setScheduleRunTime(source.getScheduleRunTime());
        entity.setScheduleRepeat(source.getScheduleRepeat());
        entity.setSlaValue(source.getSlaValue());
        entity.setSlaUnit(source.getSlaUnit());

        // flowJson của bản gốc đã được kiểm tra lúc lưu, sao chép nguyên văn
        entity = insertWithUniqueCode(entity, sourceVersion.getModelJson());
        log.info("Cloned template sourceId={} versionNo={} -> id={} code={}",
                source.getId(), sourceVersion.getVersionNo(), entity.getId(), entity.getCode());
        return toResponse(entity);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "ticket-call-flow", key = "#id")
    public TicketCallFlowResponse update(Long id, TicketCallFlowUpdateRequest request) {
        TemplateEntity entity = findActive(id);
        checkRowVersion(entity, request.getRowVersion());

        if (request.getStatus() != null) {
            validateStatusChange(entity, request.getStatus());
            entity.setStatus(request.getStatus());
        }
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        if (request.getCategory() != null) {
            entity.setCategory(request.getCategory());
        }
        if (request.getTrigger() != null) {
            applyTrigger(entity, request.getTrigger());
        }
        if (request.getSlaValue() != null || request.getSlaUnit() != null) {
            if (request.getSlaValue() == null || request.getSlaUnit() == null) {
                throw new AppException(ErrorCode.TICKET_CALL_FLOW_SLA_INVALID);
            }
            entity.setSlaValue(request.getSlaValue());
            entity.setSlaUnit(request.getSlaUnit());
        }

        TemplateVersionEntity draft = templateVersionRepository
                .findByTemplateIdAndStatus(id, TicketCallFlowVersionStatus.DRAFT)
                .orElseGet(() -> newDraft(id, templateVersionRepository.findMaxVersionNo(id) + 1));
        draft.setModelJson(validateFlowJson(request.getFlowJson()));
        applyVersionInfo(draft, request.getVersionName(), request.getVersionDescription());
        templateVersionRepository.saveAndFlush(draft);

        entity = touchAndSave(entity);
        log.info("Updated template id={} draftVersionNo={} rowVersion={}",
                entity.getId(), draft.getVersionNo(), entity.getRowVersion());
        return toResponse(entity);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "ticket-call-flow", key = "#id")
    public TicketCallFlowResponse publish(Long id, TicketCallFlowPublishRequest request) {
        TemplateEntity entity = findActive(id);
        checkRowVersion(entity, request.getRowVersion());
        TemplateVersionEntity draft = findDraftOrThrow(id);
        // TODO FR-06: chặn publish khi bản nháp chưa kiểm thử đạt (template_test_run)

        // Lưu bản cũ thành ARCHIVED trước, nếu không sẽ vướng unique key "mỗi quy trình 1 bản PUBLISHED"
        templateVersionRepository
                .findByTemplateIdAndStatus(id, TicketCallFlowVersionStatus.PUBLISHED)
                .ifPresent(old -> {
                    old.setStatus(TicketCallFlowVersionStatus.ARCHIVED);
                    templateVersionRepository.saveAndFlush(old);
                });

        applyVersionInfo(draft, request.getVersionName(), request.getVersionDescription());
        draft.setStatus(TicketCallFlowVersionStatus.PUBLISHED);
        draft.setPublishedAt(System.currentTimeMillis());
        draft.setPublishedBy(auditorAware.getCurrentAuditor().orElse(null));
        templateVersionRepository.saveAndFlush(draft);

        entity.setActiveVersionId(draft.getId());
        // Lần publish đầu tiên: quy trình bắt đầu có hiệu lực
        if (entity.getStatus() == TicketCallFlowStatus.DRAFT) {
            entity.setStatus(TicketCallFlowStatus.ACTIVE);
        }
        entity = touchAndSave(entity);
        log.info("Published template id={} versionNo={}", entity.getId(), draft.getVersionNo());
        return toResponse(entity);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "ticket-call-flow", key = "#id")
    public TicketCallFlowResponse discardDraft(Long id, TicketCallFlowPublishRequest request) {
        TemplateEntity entity = findActive(id);
        checkRowVersion(entity, request.getRowVersion());
        TemplateVersionEntity draft = findDraftOrThrow(id);

        // Bản nháp duy nhất của quy trình chưa publish: huỷ đi thì quy trình không còn nội dung
        if (templateVersionRepository.findByTemplateIdAndStatus(id, TicketCallFlowVersionStatus.PUBLISHED).isEmpty()) {
            throw new AppException(ErrorCode.TICKET_CALL_FLOW_DRAFT_NOT_DISCARDABLE);
        }
        templateVersionRepository.delete(draft);
        templateVersionRepository.flush();

        entity = touchAndSave(entity);
        log.info("Discarded draft of template id={} versionNo={}", entity.getId(), draft.getVersionNo());
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
    public PageResponse<TicketCallFlowSummaryResponse> search(TicketCallFlowSearchRequest request) {
        PageRequest pageable = PageRequest.of(request.getPage() - 1, request.getSize(), toSort(request));
        return new PageResponse<>(templateRepository.search(
                toLikePattern(request.getKeyword()),
                toLikePattern(request.getName()),
                toLikePattern(request.getCode()),
                request.getStatus(),
                request.getHasDraft(),
                request.getPublishedVersionNo(),
                request.getUpdatedFrom(),
                request.getUpdatedTo(),
                request.getPublishedFrom(),
                request.getPublishedTo(),
                pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public TicketCallFlowStatsResponse stats() {
        return templateRepository.stats();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketCallFlowVersionSummaryResponse> getVersions(Long id) {
        findActive(id);
        return templateVersionRepository.findSummariesByTemplateId(id);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketCallFlowVersionResponse getVersion(Long id, Integer versionNo) {
        findActive(id);
        TemplateVersionEntity version = templateVersionRepository
                .findByTemplateIdAndVersionNo(id, versionNo)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_CALL_FLOW_VERSION_NOT_FOUND));
        return TicketCallFlowVersionResponse.builder()
                .flowId(version.getTemplateId())
                .versionNo(version.getVersionNo())
                .status(version.getStatus())
                .versionName(version.getVersionName())
                .versionDescription(version.getVersionDescription())
                .flowJson(version.getModelJson())
                .publishedAt(version.getPublishedAt())
                .publishedBy(version.getPublishedBy())
                .createdAt(version.getCreatedAt())
                .createdBy(version.getCreatedBy())
                .updatedAt(version.getUpdatedAt())
                .updatedBy(version.getUpdatedBy())
                .build();
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "ticket-call-flow", key = "#id")
    public void delete(Long id) {
        TemplateEntity entity = findActive(id);
        // Các phiên bản giữ nguyên để tra cứu lịch sử
        entity.setDeleted(true);
        templateRepository.save(entity);
        log.info("Deleted template id={} code={}", entity.getId(), entity.getCode());
    }

    /**
     * Thêm quy trình mới kèm phiên bản 1 (DRAFT), báo lỗi nếu mã hoặc tiền tố mã hồ sơ
     * đã có trong các bản ghi chưa xoá.
     */
    private TemplateEntity insertWithUniqueCode(TemplateEntity entity, String flowJson) {
        if (templateRepository.existsByCodeAndDeletedFalse(entity.getCode())) {
            throw new AppException(ErrorCode.TICKET_CALL_FLOW_CODE_EXISTED);
        }
        if (templateRepository.existsByCaseCodePrefixAndDeletedFalse(entity.getCaseCodePrefix())) {
            throw new AppException(ErrorCode.TICKET_CALL_FLOW_CASE_CODE_PREFIX_EXISTED);
        }
        try {
            entity = templateRepository.saveAndFlush(entity);
        } catch (DataIntegrityViolationException e) {
            // 2 request cùng tạo 1 mã / 1 tiền tố: request sau vướng unique key, phân biệt theo tên ràng buộc
            String message = String.valueOf(e.getMostSpecificCause().getMessage());
            throw new AppException(message.contains("uk_template_active_case_prefix")
                    ? ErrorCode.TICKET_CALL_FLOW_CASE_CODE_PREFIX_EXISTED
                    : ErrorCode.TICKET_CALL_FLOW_CODE_EXISTED, e);
        }
        TemplateVersionEntity draft = newDraft(entity.getId(), 1);
        draft.setModelJson(flowJson);
        templateVersionRepository.saveAndFlush(draft);
        return entity;
    }

    /**
     * Kiểm tra field bắt buộc theo loại kích hoạt rồi gán vào quy trình.
     * Chỉ lưu field của loại đã chọn, field của loại khác xoá về null để không còn cấu hình cũ.
     */
    private static void applyTrigger(TemplateEntity entity, TicketCallFlowTriggerDto trigger) {
        TriggerType type = trigger.getType();
        boolean once = type == TriggerType.SCHEDULE && trigger.getScheduleType() == ScheduleType.ONCE;
        boolean repeat = type == TriggerType.SCHEDULE && trigger.getScheduleType() == ScheduleType.REPEAT;

        // ponytail: HYBRID chưa có thiết kế chi tiết nên chưa kiểm field nào, bổ sung khi BA chốt
        if (type == TriggerType.MANUAL && !StringUtils.hasText(trigger.getInputFormId())) {
            throw triggerInvalid("inputFormId");
        }
        if (type == TriggerType.AUTO && !StringUtils.hasText(trigger.getApiId())) {
            throw triggerInvalid("apiId");
        }
        if (type == TriggerType.SCHEDULE && trigger.getScheduleType() == null) {
            throw triggerInvalid("scheduleType");
        }
        if (once && trigger.getRunDate() == null) {
            throw triggerInvalid("runDate");
        }
        if (type == TriggerType.SCHEDULE && trigger.getRunTime() == null) {
            throw triggerInvalid("runTime");
        }
        if (repeat && trigger.getRepeat() == null) {
            throw triggerInvalid("repeat");
        }

        entity.setTriggerType(type);
        entity.setInputFormId(type == TriggerType.MANUAL ? trigger.getInputFormId() : null);
        entity.setTriggerApiId(type == TriggerType.AUTO ? trigger.getApiId() : null);
        entity.setScheduleType(type == TriggerType.SCHEDULE ? trigger.getScheduleType() : null);
        entity.setScheduleRunDate(once ? trigger.getRunDate() : null);
        entity.setScheduleRunTime(type == TriggerType.SCHEDULE ? trigger.getRunTime() : null);
        entity.setScheduleRepeat(repeat ? trigger.getRepeat() : null);
    }

    private static AppException triggerInvalid(String field) {
        return new AppException(ErrorCode.TICKET_CALL_FLOW_TRIGGER_INVALID,
                "err.ticketCallFlow.trigger." + field + ".required");
    }

    private static TicketCallFlowTriggerDto toTriggerDto(TemplateEntity entity) {
        if (entity.getTriggerType() == null) {
            return null;
        }
        return TicketCallFlowTriggerDto.builder()
                .type(entity.getTriggerType())
                .inputFormId(entity.getInputFormId())
                .apiId(entity.getTriggerApiId())
                .scheduleType(entity.getScheduleType())
                .runDate(entity.getScheduleRunDate())
                .runTime(entity.getScheduleRunTime())
                .repeat(entity.getScheduleRepeat())
                .build();
    }

    /** Gán tên / mô tả phiên bản: null = giữ nguyên, chuỗi rỗng = xoá. */
    private static void applyVersionInfo(TemplateVersionEntity version, String name, String description) {
        if (name != null) {
            version.setVersionName(StringUtils.hasText(name) ? name : null);
        }
        if (description != null) {
            version.setVersionDescription(StringUtils.hasText(description) ? description : null);
        }
    }

    private static TemplateVersionEntity newDraft(Long templateId, int versionNo) {
        TemplateVersionEntity draft = new TemplateVersionEntity();
        draft.setTemplateId(templateId);
        draft.setVersionNo(versionNo);
        draft.setStatus(TicketCallFlowVersionStatus.DRAFT);
        return draft;
    }

    /**
     * Đánh dấu quy trình vừa thay đổi rồi lưu, để row_version tăng kể cả khi chỉ sửa canvas (nằm ở bảng phiên bản).
     * Câu UPDATE kèm điều kiện row_version cũ nên 2 người lưu cùng lúc thì người sau nhận 409.
     */
    private TemplateEntity touchAndSave(TemplateEntity entity) {
        long now = System.currentTimeMillis();
        Long updatedAt = entity.getUpdatedAt();
        entity.setUpdatedAt(updatedAt != null && updatedAt >= now ? updatedAt + 1 : now);
        return templateRepository.saveAndFlush(entity);
    }

    /** Người khác đã lưu sau lần FE lấy dữ liệu: chặn để không ghi đè mất thay đổi của họ. */
    private static void checkRowVersion(TemplateEntity entity, Long rowVersion) {
        if (rowVersion != null && !Objects.equals(rowVersion, entity.getRowVersion())) {
            throw new AppException(ErrorCode.DATA_CONFLICT);
        }
    }

    /** Chưa publish lần nào: chỉ DRAFT. Đã publish: chỉ chuyển giữa ACTIVE và INACTIVE. */
    private void validateStatusChange(TemplateEntity entity, TicketCallFlowStatus status) {
        boolean published = entity.getStatus() != TicketCallFlowStatus.DRAFT;
        if (published == (status == TicketCallFlowStatus.DRAFT)) {
            throw new AppException(ErrorCode.TICKET_CALL_FLOW_STATUS_INVALID);
        }
    }

    private TemplateVersionEntity findDraftOrThrow(Long templateId) {
        return templateVersionRepository
                .findByTemplateIdAndStatus(templateId, TicketCallFlowVersionStatus.DRAFT)
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_CALL_FLOW_DRAFT_NOT_FOUND));
    }

    /** Bản đang sửa: bản nháp nếu có, không thì bản đang hiệu lực. */
    private TemplateVersionEntity findEditingVersion(Long templateId) {
        return templateVersionRepository
                .findByTemplateIdAndStatus(templateId, TicketCallFlowVersionStatus.DRAFT)
                .or(() -> templateVersionRepository.findByTemplateIdAndStatus(templateId, TicketCallFlowVersionStatus.PUBLISHED))
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_CALL_FLOW_VERSION_NOT_FOUND));
    }

    private TemplateEntity findActive(Long id) {
        return templateRepository
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

    /** Sắp xếp theo sortBy/sortDir (mặc định updatedAt giảm dần), luôn thêm id để phân trang ổn định. */
    private static Sort toSort(TicketCallFlowSearchRequest request) {
        String sortBy = StringUtils.hasText(request.getSortBy()) ? request.getSortBy().trim() : "updatedAt";
        String path = SORT_FIELDS.get(sortBy);
        if (path == null) {
            throw new AppException(ErrorCode.TICKET_CALL_FLOW_SORT_INVALID);
        }
        Sort.Direction direction = StringUtils.hasText(request.getSortDir())
                ? Sort.Direction.fromString(request.getSortDir().trim())
                : Sort.Direction.DESC;
        // Đường dẫn lấy từ whitelist SORT_FIELDS nên dùng unsafe được (cần cho alias p., d.)
        Sort sort = JpaSort.unsafe(direction, path);
        return "id".equals(sortBy) ? sort : sort.and(JpaSort.unsafe(Sort.Direction.DESC, "t.id"));
    }

    private TicketCallFlowResponse toResponse(TemplateEntity entity) {
        TemplateVersionEntity published = templateVersionRepository
                .findByTemplateIdAndStatus(entity.getId(), TicketCallFlowVersionStatus.PUBLISHED)
                .orElse(null);
        TemplateVersionEntity draft = templateVersionRepository
                .findByTemplateIdAndStatus(entity.getId(), TicketCallFlowVersionStatus.DRAFT)
                .orElse(null);
        TemplateVersionEntity editing = draft != null ? draft : published;

        return TicketCallFlowResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .caseCodePrefix(entity.getCaseCodePrefix())
                .category(entity.getCategory())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .trigger(toTriggerDto(entity))
                .slaValue(entity.getSlaValue())
                .slaUnit(entity.getSlaUnit())
                .flowJson(editing != null ? editing.getModelJson() : null)
                .flowJsonVersionNo(editing != null ? editing.getVersionNo() : null)
                .flowJsonVersionStatus(editing != null ? editing.getStatus() : null)
                .publishedVersion(toVersionSummary(published))
                .draftVersion(toVersionSummary(draft))
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(entity.getUpdatedBy())
                .rowVersion(entity.getRowVersion())
                .build();
    }

    private static TicketCallFlowVersionSummaryResponse toVersionSummary(TemplateVersionEntity version) {
        if (version == null) {
            return null;
        }
        return TicketCallFlowVersionSummaryResponse.builder()
                .versionNo(version.getVersionNo())
                .status(version.getStatus())
                .versionName(version.getVersionName())
                .versionDescription(version.getVersionDescription())
                .publishedAt(version.getPublishedAt())
                .publishedBy(version.getPublishedBy())
                .createdAt(version.getCreatedAt())
                .createdBy(version.getCreatedBy())
                .updatedAt(version.getUpdatedAt())
                .updatedBy(version.getUpdatedBy())
                .build();
    }
}
