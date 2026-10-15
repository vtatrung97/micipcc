package com.lifesup.ticketflow.core.dto.response;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FormResponse {
    /** TSID, trả dạng chuỗi vì vượt giới hạn số nguyên an toàn của JavaScript. */
    @JsonSerialize(using = ToStringSerializer.class)
    @Schema(type = "string", example = "900000000000000201")
    Long id;
    String code;
    String name;
    String title;
    String description;
    Long createdAt;
    String createdBy;
    Long updatedAt;
    String updatedBy;
    Long rowVersion;
    /** Sắp theo vị trí tăng dần. */
    List<Field> fields;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Field {
        @JsonSerialize(using = ToStringSerializer.class)
        @Schema(type = "string", example = "900000000000000211")
        Long id;
        String code;
        String name;
        @Schema(example = "COMBOBOX_SINGLE")
        String dataType;
        @Schema(description = "Danh sách lựa chọn, null với kiểu không có lựa chọn", example = "[\"VIP\", \"KHTV\"]")
        List<String> options;
        Integer position;
        boolean required;
    }
}
