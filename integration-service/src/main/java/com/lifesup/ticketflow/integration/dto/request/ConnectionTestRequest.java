package com.lifesup.ticketflow.integration.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.ticketflow.common.json.StringTrimDeserializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Test kết nối trên dữ liệu form chưa lưu. */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConnectionTestRequest {

    @Schema(example = "https://crm.example.com/api")
    @NotBlank(message = "{validation.connection.baseUrl.required}")
    @Size(max = 1000, message = "{validation.connection.baseUrl.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String baseUrl;

    @Schema(description = "Mặc định 5000, tối đa dùng 10000 khi test")
    @Min(value = 100, message = "{validation.connection.timeoutMs.range}")
    @Max(value = 60000, message = "{validation.connection.timeoutMs.range}")
    Integer timeoutMs;
}
