package com.lifesup.ticketflow.engine.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.common.api.ApiResponse;
import com.lifesup.ticketflow.engine.dto.request.DeployDefinitionRequest;
import com.lifesup.ticketflow.engine.dto.request.StartInstanceRequest;
import com.lifesup.ticketflow.engine.dto.request.ValidateDefinitionRequest;
import com.lifesup.ticketflow.engine.dto.response.ProcessInstanceResponse;
import com.lifesup.ticketflow.engine.dto.response.ValidationResultResponse;
import com.lifesup.ticketflow.engine.service.DefinitionService;
import com.lifesup.ticketflow.engine.service.ProcessInstanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * API test/debug (gọi bằng Postman) với 5 quy trình mẫu của FE trong resources/sample.
 * Mỗi quy trình có 2 API: deploy (validate rồi lưu vào Flowable) và run (khởi tạo phiên chạy với input mẫu).
 * Body của run (tuỳ chọn) ghi đè lên input mẫu. Chỉ dùng để test, xoá trước khi lên production.
 */
@Tag(name = "Test (sample flows)")
@RestController
@RequestMapping("/internal/test/samples")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TestController {
    static final String KHIEU_NAI_THU_CONG = "QT_KHIEU_NAI_THU_CONG";
    static final String TICKET_TU_DONG = "QT_TICKET_TU_DONG";
    static final String HO_TRO_KY_THUAT_HYBRID = "QT_HO_TRO_KY_THUAT_HYBRID";
    static final String HAPPY_CALL_DINH_KY = "QT_HAPPY_CALL_DINH_KY";
    static final String CON_XAC_MINH = "QT_CON_XAC_MINH";
    static final DateTimeFormatter BUSINESS_KEY_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    DefinitionService definitionService;
    ProcessInstanceService processInstanceService;
    ObjectMapper objectMapper;

    // ---------- Deploy: validate + lưu ----------

    @Operation(summary = "Deploy QT_KHIEU_NAI_THU_CONG (MANUAL)")
    @PostMapping("/khieu-nai-thu-cong/deploy")
    public ApiResponse<Map<String, Object>> deployKhieuNaiThuCong() {
        return ApiResponse.success(deploy(KHIEU_NAI_THU_CONG));
    }

    @Operation(summary = "Deploy QT_TICKET_TU_DONG (AUTO)")
    @PostMapping("/ticket-tu-dong/deploy")
    public ApiResponse<Map<String, Object>> deployTicketTuDong() {
        return ApiResponse.success(deploy(TICKET_TU_DONG));
    }

    @Operation(summary = "Deploy QT_HO_TRO_KY_THUAT_HYBRID (HYBRID)")
    @PostMapping("/ho-tro-ky-thuat-hybrid/deploy")
    public ApiResponse<Map<String, Object>> deployHoTroKyThuatHybrid() {
        return ApiResponse.success(deploy(HO_TRO_KY_THUAT_HYBRID));
    }

    @Operation(summary = "Deploy QT_HAPPY_CALL_DINH_KY (SCHEDULE)")
    @PostMapping("/happy-call-dinh-ky/deploy")
    public ApiResponse<Map<String, Object>> deployHappyCallDinhKy() {
        return ApiResponse.success(deploy(HAPPY_CALL_DINH_KY));
    }

    @Operation(summary = "Deploy QT_CON_XAC_MINH (quy trình con)")
    @PostMapping("/con-xac-minh/deploy")
    public ApiResponse<Map<String, Object>> deployConXacMinh() {
        return ApiResponse.success(deploy(CON_XAC_MINH));
    }

    // ---------- Run: khởi tạo phiên chạy ----------

    @Operation(summary = "Chạy QT_KHIEU_NAI_THU_CONG", description = "Body tuỳ chọn, ghi đè input mẫu")
    @PostMapping("/khieu-nai-thu-cong/run")
    public ApiResponse<ProcessInstanceResponse> runKhieuNaiThuCong(
            @RequestParam(required = false) String businessKey,
            @RequestBody(required = false) Map<String, Object> input) {
        Map<String, Object> defaults = new LinkedHashMap<>();
        defaults.put("ticket_level_1", "PAKN-2026-00001");
        defaults.put("priority", "Cao");
        defaults.put("customer_phone", "0912345678");
        defaults.put("content", "Cước tháng 9 bị tính sai");
        return ApiResponse.success(run(KHIEU_NAI_THU_CONG, businessKey, defaults, input));
    }

    @Operation(summary = "Chạy QT_TICKET_TU_DONG", description = "Body tuỳ chọn, ghi đè input mẫu")
    @PostMapping("/ticket-tu-dong/run")
    public ApiResponse<ProcessInstanceResponse> runTicketTuDong(
            @RequestParam(required = false) String businessKey,
            @RequestBody(required = false) Map<String, Object> input) {
        Map<String, Object> defaults = new LinkedHashMap<>();
        defaults.put("ticketId", "TK-2026-00001");
        defaults.put("ticketType", "KHIEU_NAI");
        defaults.put("priority", "Cao");
        defaults.put("customerId", "KH0001");
        return ApiResponse.success(run(TICKET_TU_DONG, businessKey, defaults, input));
    }

    @Operation(summary = "Chạy QT_HO_TRO_KY_THUAT_HYBRID", description = "Body tuỳ chọn, ghi đè input mẫu (form field)")
    @PostMapping("/ho-tro-ky-thuat-hybrid/run")
    public ApiResponse<ProcessInstanceResponse> runHoTroKyThuatHybrid(
            @RequestParam(required = false) String businessKey,
            @RequestBody(required = false) Map<String, Object> input) {
        Map<String, Object> defaults = new LinkedHashMap<>();
        defaults.put("ticket_level_1", "KN-2026-00001");
        defaults.put("complaint_type", "KY_THUAT");
        defaults.put("priority", "Cao");
        defaults.put("customer_phone", "0912345678");
        return ApiResponse.success(run(HO_TRO_KY_THUAT_HYBRID, businessKey, defaults, input));
    }

    @Operation(summary = "Chạy QT_HAPPY_CALL_DINH_KY", description = "Biến START là hằng số nên không cần input")
    @PostMapping("/happy-call-dinh-ky/run")
    public ApiResponse<ProcessInstanceResponse> runHappyCallDinhKy(
            @RequestParam(required = false) String businessKey,
            @RequestBody(required = false) Map<String, Object> input) {
        return ApiResponse.success(run(HAPPY_CALL_DINH_KY, businessKey, new LinkedHashMap<>(), input));
    }

    @Operation(summary = "Chạy QT_CON_XAC_MINH", description = "Body tuỳ chọn, ghi đè input mẫu")
    @PostMapping("/con-xac-minh/run")
    public ApiResponse<ProcessInstanceResponse> runConXacMinh(
            @RequestParam(required = false) String businessKey,
            @RequestBody(required = false) Map<String, Object> input) {
        Map<String, Object> defaults = new LinkedHashMap<>();
        defaults.put("ticketId", "TK-2026-00001");
        return ApiResponse.success(run(CON_XAC_MINH, businessKey, defaults, input));
    }

    // ---------- Helper ----------

    /** Validate trước; có lỗi thì trả danh sách lỗi, không deploy. */
    private Map<String, Object> deploy(String code) {
        JsonNode sample = readSample(code);
        String processName = sample.path("name").asText(code);
        String flowJson = sample.path("flowJson").asText();

        ValidateDefinitionRequest validateRequest = new ValidateDefinitionRequest();
        validateRequest.setProcessKey(code);
        validateRequest.setProcessName(processName);
        validateRequest.setFlowJson(flowJson);
        ValidationResultResponse validation = definitionService.validate(validateRequest);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("validation", validation);
        if (!validation.isValid()) {
            return result;
        }

        DeployDefinitionRequest deployRequest = new DeployDefinitionRequest();
        deployRequest.setProcessKey(code);
        deployRequest.setProcessName(processName);
        deployRequest.setVersionNo(1);
        deployRequest.setFlowJson(flowJson);
        result.put("deployment", definitionService.deploy(deployRequest));
        return result;
    }

    private ProcessInstanceResponse run(String code, String businessKey, Map<String, Object> defaults,
            Map<String, Object> overrides) {
        if (overrides != null) {
            defaults.putAll(overrides);
        }
        StartInstanceRequest request = new StartInstanceRequest();
        request.setProcessKey(code);
        request.setBusinessKey(businessKey != null && !businessKey.isBlank()
                ? businessKey
                : code + "-" + LocalDateTime.now().format(BUSINESS_KEY_TIME));
        request.setInput(defaults);
        return processInstanceService.start(request);
    }

    private JsonNode readSample(String code) {
        try (InputStream stream = new ClassPathResource("sample/" + code + ".json").getInputStream()) {
            return objectMapper.readTree(stream);
        } catch (IOException exception) {
            throw new UncheckedIOException("Cannot read sample " + code, exception);
        }
    }
}
