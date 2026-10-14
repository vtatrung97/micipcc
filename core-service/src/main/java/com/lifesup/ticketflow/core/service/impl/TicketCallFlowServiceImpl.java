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
import com.lifesup.ticketflow.core.dto.response.UserOptionResponse;
import com.lifesup.ticketflow.core.entity.TemplateEntity;
import com.lifesup.ticketflow.core.entity.TemplateVersionEntity;
import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.common.exception.ErrorCode;
import com.lifesup.ticketflow.core.common.exception.CoreErrorCode;
import static com.lifesup.ticketflow.core.common.util.QueryUtils.toLikePattern;
import com.lifesup.ticketflow.core.repository.TemplateRepository;
import com.lifesup.ticketflow.core.repository.TemplateVersionRepository;
import com.lifesup.ticketflow.core.service.TicketCallFlowService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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
 * - Lưu canvas theo versionId: phiên bản đang PUBLISHED giữ nguyên, sinh phiên bản DRAFT mới (max + 1);
 *   phiên bản DRAFT / ARCHIVED thì ghi đè trực tiếp. Một quy trình có thể có nhiều bản DRAFT.
 * - Ban hành theo versionId (bất kỳ phiên bản nào): bản PUBLISHED cũ thành ARCHIVED, quy trình chuyển sang ACTIVE.
 * - Xoá theo versionId (trừ bản đang ban hành); xoá hết phiên bản thì xoá mềm quy trình.
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
            Map.entry("templateId", "t.id"),
            Map.entry("templateVersionId", "v.id"),
            Map.entry("code", "t.code"),
            Map.entry("name", "t.name"),
            Map.entry("category", "t.category"),
            Map.entry("description", "t.description"),
            Map.entry("status", "t.status"),
            Map.entry("triggerType", "t.triggerType"),
            Map.entry("slaValue", "t.slaValue"),
            Map.entry("slaUnit", "t.slaUnit"),
            Map.entry("versionNo", "v.versionNo"),
            Map.entry("versionStatus", "v.status"),
            Map.entry("versionName", "v.versionName"),
            Map.entry("publishedAt", "v.publishedAt"),
            Map.entry("publishedBy", "v.publishedBy"),
            Map.entry("createdAt", "v.createdAt"),
            Map.entry("createdBy", "v.createdBy"),
            Map.entry("updatedAt", "v.updatedAt"),
            Map.entry("updatedBy", "v.updatedBy"),
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
            throw new AppException(CoreErrorCode.TICKET_CALL_FLOW_STATUS_INVALID);
        }

        TemplateEntity entity = new TemplateEntity();
        entity.setCode(request.getCode());
        entity.setName(request.getName());
        entity.setCategory(request.getCategory());
        entity.setDescription(request.getDescription());
        entity.setStatus(TicketCallFlowStatus.DRAFT);
        applyTrigger(entity, request.getTrigger());
        entity.setSlaValue(request.getSlaValue());
        entity.setSlaUnit(request.getSlaUnit());

        TemplateVersionEntity version = insertWithUniqueCode(entity, validateFlowJson(request.getFlowJson()));
        log.info("Created template id={} code={}", entity.getId(), entity.getCode());
        return toResponse(entity, version);
    }

    @Override
    @Transactional
    public TicketCallFlowResponse clone(Long id, Long versionId, TicketCallFlowCloneRequest request) {
        TemplateEntity source = findActive(id);
        TemplateVersionEntity sourceVersion = findVersion(id, versionId);

        TemplateEntity entity = new TemplateEntity();
        entity.setCode(request.getCode());
        entity.setName(request.getName());
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
        TemplateVersionEntity version = insertWithUniqueCode(entity, sourceVersion.getModelJson());
        log.info("Cloned template sourceId={} versionNo={} -> id={} code={}",
                source.getId(), sourceVersion.getVersionNo(), entity.getId(), entity.getCode());
        return toResponse(entity, version);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "ticket-call-flow", key = "#id")
    public TicketCallFlowResponse update(Long id, Long versionId, TicketCallFlowUpdateRequest request) {
        TemplateEntity entity = findActive(id);
        checkRowVersion(entity, request.getRowVersion());
        TemplateVersionEntity version = findVersion(id, versionId);

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
                throw new AppException(CoreErrorCode.TICKET_CALL_FLOW_SLA_INVALID);
            }
            entity.setSlaValue(request.getSlaValue());
            entity.setSlaUnit(request.getSlaUnit());
        }

        // Bản đang ban hành giữ nguyên cho Flow đang chạy: sửa thì sinh phiên bản mới; trạng thái khác sửa trực tiếp
        if (version.getStatus() == TicketCallFlowVersionStatus.PUBLISHED) {
            version = newDraft(id, templateVersionRepository.findMaxVersionNo(id) + 1);
        }
        version.setModelJson(validateFlowJson(request.getFlowJson()));
        applyVersionInfo(version, request.getVersionName(), request.getVersionDescription());
        templateVersionRepository.saveAndFlush(version);

        entity = touchAndSave(entity);
        log.info("Updated template id={} versionNo={} rowVersion={}",
                entity.getId(), version.getVersionNo(), entity.getRowVersion());
        return toResponse(entity, version);
    }

    @Override
    @Transactional
    @CacheEvict(cacheNames = "ticket-call-flow", key = "#id")
    public TicketCallFlowResponse publish(Long id, Long versionId, TicketCallFlowPublishRequest request) {
        TemplateEntity entity = findActive(id);
        checkRowVersion(entity, request.getRowVersion());
        TemplateVersionEntity version = findVersion(id, versionId);
        // TODO FR-06: chặn publish khi phiên bản chưa kiểm thử đạt (template_test_run)

        if (version.getStatus() != TicketCallFlowVersionStatus.PUBLISHED) {
            // Mỗi quy trình tối đa 1 bản PUBLISHED (chỉ ứng dụng đảm bảo, DB không chặn): bản cũ chuyển ARCHIVED trước
            // ponytail: 2 người ban hành cùng lúc dựa vào rowVersion của template (409); cần chặn chắc thì lock theo template
            templateVersionRepository
                    .findByTemplateIdAndStatus(id, TicketCallFlowVersionStatus.PUBLISHED)
                    .ifPresent(old -> {
                        old.setStatus(TicketCallFlowVersionStatus.ARCHIVED);
                        templateVersionRepository.saveAndFlush(old);
                    });
            version.setStatus(TicketCallFlowVersionStatus.PUBLISHED);
            version.setPublishedAt(System.currentTimeMillis());
            version.setPublishedBy(auditorAware.getCurrentAuditor().orElse(null));
        }
        applyVersionInfo(version, request.getVersionName(), request.getVersionDescription());
        templateVersionRepository.saveAndFlush(version);

        entity.setActiveVersionId(version.getId());
        // Ban hành từ Nháp hoặc Dừng ban hành đều chuyển sang Đang ban hành (TLNV)
        entity.setStatus(TicketCallFlowStatus.ACTIVE);
        entity = touchAndSave(entity);
        log.info("Published template id={} versionNo={}", entity.getId(), version.getVersionNo());
        return toResponse(entity, version);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(cacheNames = "ticket-call-flow", key = "#id", unless = "#result == null")
    public TicketCallFlowResponse getById(Long id) {
        TemplateEntity entity = findActive(id);
        // Bản đang ban hành, chưa có thì phiên bản mới nhất
        TemplateVersionEntity version = templateVersionRepository
                .findByTemplateIdAndStatus(id, TicketCallFlowVersionStatus.PUBLISHED)
                .or(() -> templateVersionRepository.findFirstByTemplateIdOrderByVersionNoDesc(id))
                .orElse(null);
        return toResponse(entity, version);
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
                request.getVersionStatus(),
                request.getVersionNo(),
                request.getUpdatedFrom(),
                request.getUpdatedTo(),
                request.getPublishedFrom(),
                request.getPublishedTo(),
                pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public TicketCallFlowStatsResponse stats() {
        return TicketCallFlowStatsResponse.builder()
                .total(templateRepository.countByDeletedFalse())
                .active(templateRepository.countByDeletedFalseAndStatus(TicketCallFlowStatus.ACTIVE))
                .hasDraft(templateVersionRepository.countTemplatesHavingDraft())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> searchCategories(String keyword) {
        return templateRepository.findCategories(toLikePattern(keyword));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserOptionResponse> searchCreators(String keyword) {
        return templateVersionRepository.findCreators(toLikePattern(keyword));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserOptionResponse> searchUpdaters(String keyword) {
        return templateVersionRepository.findUpdaters(toLikePattern(keyword));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TicketCallFlowVersionSummaryResponse> getVersions(Long id) {
        findActive(id);
        return templateVersionRepository.findSummariesByTemplateId(id);
    }

    @Override
    @Transactional(readOnly = true)
    public TicketCallFlowVersionResponse getVersion(Long id, Long versionId) {
        findActive(id);
        TemplateVersionEntity version = findVersion(id, versionId);
        return TicketCallFlowVersionResponse.builder()
                .flowId(version.getTemplateId())
                .id(version.getId())
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
    public void delete(Long id, Long versionId) {
        TemplateEntity entity = findActive(id);
        TemplateVersionEntity version = findVersion(id, versionId);
        // Bản đang ban hành còn được Flow dùng: muốn bỏ thì ban hành phiên bản khác trước
        if (version.getStatus() == TicketCallFlowVersionStatus.PUBLISHED) {
            throw new AppException(CoreErrorCode.TICKET_CALL_FLOW_VERSION_NOT_DELETABLE);
        }
        templateVersionRepository.delete(version);
        templateVersionRepository.flush();

        // Không còn phiên bản nào thì xoá mềm luôn quy trình (giải phóng mã / tiền tố mã hồ sơ)
        if (templateVersionRepository.countByTemplateId(id) == 0) {
            entity.setDeleted(true);
        }
        touchAndSave(entity);
        log.info("Deleted version of template id={} versionNo={} templateDeleted={}",
                id, version.getVersionNo(), entity.isDeleted());
    }

    /**
     * Thêm quy trình mới kèm phiên bản 1 (DRAFT), báo lỗi nếu mã đã có trong các quy trình chưa xoá (deleted = false).
     * Trả về phiên bản 1; {@code entity} được persist tại chỗ (có id sau khi gọi).
     */
    private TemplateVersionEntity insertWithUniqueCode(TemplateEntity entity, String flowJson) {
        // ponytail: chỉ kiểm ở ứng dụng, 2 request tạo cùng mã cùng lúc vẫn có thể lọt; cần chặn thì thêm lock theo mã
        if (templateRepository.existsByCodeAndDeletedFalse(entity.getCode())) {
            throw new AppException(CoreErrorCode.TICKET_CALL_FLOW_CODE_EXISTED);
        }
        templateRepository.saveAndFlush(entity);
        TemplateVersionEntity draft = newDraft(entity.getId(), 1);
        draft.setModelJson(flowJson);
        return templateVersionRepository.saveAndFlush(draft);
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
        return new AppException(CoreErrorCode.TICKET_CALL_FLOW_TRIGGER_INVALID,
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
            throw new AppException(CoreErrorCode.TICKET_CALL_FLOW_STATUS_INVALID);
        }
    }

    /** Phiên bản phải thuộc đúng quy trình trên URL. */
    private TemplateVersionEntity findVersion(Long templateId, Long versionId) {
        return templateVersionRepository
                .findByIdAndTemplateId(versionId, templateId)
                .orElseThrow(() -> new AppException(CoreErrorCode.TICKET_CALL_FLOW_VERSION_NOT_FOUND));
    }

    private TemplateEntity findActive(Long id) {
        return templateRepository
                .findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new AppException(CoreErrorCode.TICKET_CALL_FLOW_NOT_FOUND));
    }

    /**
     * Kiểm tra chuỗi flowJson trước khi lưu, KHÔNG biến đổi nội dung (lưu và trả lại nguyên văn):
     * - không vượt quá giới hạn kích thước
     * - đúng cú pháp JSON (bảng có CHECK JSON_VALID, kiểm tra trước để trả lỗi rõ ràng thay vì lỗi ràng buộc DB)
     * Việc đọc JSON để chuyển sang BPMN/Flowable làm ở bước sau.
     */
    private String validateFlowJson(String flowJson) {
        if (flowJson.length() > MAX_FLOW_JSON_LENGTH) {
            throw new AppException(CoreErrorCode.FLOW_JSON_TOO_LARGE);
        }
        try {
            objectMapper.readTree(flowJson);
        } catch (JsonProcessingException e) {
            throw new AppException(CoreErrorCode.FLOW_JSON_INVALID, e);
        }
        return flowJson;
    }

    /** Sắp xếp theo sortBy/sortDir (mặc định updatedAt giảm dần), luôn thêm id để phân trang ổn định. */
    private static Sort toSort(TicketCallFlowSearchRequest request) {
        String sortBy = StringUtils.hasText(request.getSortBy()) ? request.getSortBy().trim() : "updatedAt";
        String path = SORT_FIELDS.get(sortBy);
        if (path == null) {
            throw new AppException(CoreErrorCode.TICKET_CALL_FLOW_SORT_INVALID);
        }
        Sort.Direction direction = StringUtils.hasText(request.getSortDir())
                ? Sort.Direction.fromString(request.getSortDir().trim())
                : Sort.Direction.DESC;
        // Đường dẫn lấy từ whitelist SORT_FIELDS nên dùng unsafe được (cần cho alias t., v.)
        Sort sort = JpaSort.unsafe(direction, path);
        return "templateVersionId".equals(sortBy) ? sort : sort.and(JpaSort.unsafe(Sort.Direction.DESC, "v.id"));
    }

    /** {@code editing}: phiên bản trả kèm flowJson, null = không có. */
    private TicketCallFlowResponse toResponse(TemplateEntity entity, TemplateVersionEntity editing) {
        TemplateVersionEntity published = editing != null && editing.getStatus() == TicketCallFlowVersionStatus.PUBLISHED
                ? editing
                : templateVersionRepository
                        .findByTemplateIdAndStatus(entity.getId(), TicketCallFlowVersionStatus.PUBLISHED)
                        .orElse(null);

        return TicketCallFlowResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .category(entity.getCategory())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .trigger(toTriggerDto(entity))
                .slaValue(entity.getSlaValue())
                .slaUnit(entity.getSlaUnit())
                .flowJson(editing != null ? editing.getModelJson() : null)
                .flowJsonVersionId(editing != null ? editing.getId() : null)
                .flowJsonVersionNo(editing != null ? editing.getVersionNo() : null)
                .flowJsonVersionStatus(editing != null ? editing.getStatus() : null)
                .publishedVersion(toVersionSummary(published))
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
                .id(version.getId())
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
