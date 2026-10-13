package com.lifesup.ticketflow.integration.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.ticketflow.common.json.StringTrimDeserializer;
import com.lifesup.ticketflow.integration.common.enums.HttpMethod;
import com.lifesup.ticketflow.integration.dto.data.RetryPolicyData;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.Map;

/** Sửa bản nháp (kết nối, mã, version không đổi). Là cập nhật toàn bộ. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OperationUpdateRequest implements OperationDefinition {

    @NotBlank(message = "{validation.operation.name.required}")
    @Size(max = 255, message = "{validation.operation.name.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String name;

    @Size(max = 1000, message = "{validation.operation.description.size}")
    String description;

    @NotNull(message = "{validation.operation.httpMethod.required}")
    HttpMethod httpMethod;

    @Schema(description = "Nối sau baseUrl của kết nối, cho phép biến {tenBien}", example = "/customers/{phone}")
    @NotBlank(message = "{validation.operation.path.required}")
    @Size(max = 1000, message = "{validation.operation.path.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String path;

    @Schema(description = "Header (object chuỗi → chuỗi), giá trị cố định hoặc dùng tham số đầu vào qua {name}. "
            + "Không chứa thông tin xác thực (gắn từ kết nối)",
            example = "{\"Accept\":\"application/json\",\"X-Channel\":\"{channel}\"}")
    Map<String, String> headers;

    @Schema(description = "Tham số query, giá trị cố định hoặc dùng tham số đầu vào qua {name}", example = "{\"lang\":\"vi\"}")
    Map<String, String> queryParams;

    @Schema(description = "Tham số đầu vào của API, hiển thị ở màn thiết kế Flow để map với biến quy trình")
    @Size(max = 100, message = "{validation.operation.inputParams.size}")
    List<@NotNull(message = "{validation.operation.param.required}") @Valid OperationInputParam> inputParams;

    @Schema(description = "Giá trị đầu ra của API cho Flow, hiển thị ở màn thiết kế Flow để gán vào biến quy trình")
    @Size(max = 100, message = "{validation.operation.outputParams.size}")
    List<@NotNull(message = "{validation.operation.param.required}") @Valid OperationOutputParam> outputParams;

    @Schema(description = "JSON Schema kiểm dữ liệu gửi đi")
    JsonNode requestSchema;

    @Schema(description = "JSON Schema kiểm dữ liệu nhận về")
    JsonNode responseSchema;

    @Schema(description = "Biểu thức JSONata chỉ dựng BODY request, dùng $input.<name>. Bỏ trống: GET/DELETE không có body, "
            + "POST/PUT/PATCH gửi các tham số không dùng ở path / headers / queryParams")
    String requestMapping;

    @Schema(description = "Biểu thức JSONata dựng object đầu ra (key = outputParams.name) từ $response. "
            + "Bỏ trống: mỗi giá trị lấy field cùng tên ở cấp đầu của response body")
    String responseMapping;

    @Schema(description = "Bỏ trống = dùng timeout của kết nối")
    @Min(value = 100, message = "{validation.operation.timeoutMs.range}")
    @Max(value = 60000, message = "{validation.operation.timeoutMs.range}")
    Integer timeoutMs;

    @Schema(description = "Chính sách retry: maxAttempts, backoffMs, backoffMultiplier, retryOnStatus, retryOnTimeout",
            example = "{\"maxAttempts\":3,\"backoffMs\":500,\"retryOnStatus\":[502,503,504]}")
    @Valid
    RetryPolicyData retryPolicy;

    @Schema(description = "rowVersion lấy từ lần GET gần nhất; có truyền mà khác DB thì trả 409")
    Long rowVersion;
}
