package com.lifesup.ticketflow.core.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.ticketflow.common.json.StringTrimDeserializer;
import com.lifesup.ticketflow.core.common.enums.ScheduleRepeat;
import com.lifesup.ticketflow.core.common.enums.ScheduleType;
import com.lifesup.ticketflow.core.common.enums.TriggerType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TicketCallFlowTriggerDto {

    @NotNull(message = "{validation.ticketCallFlow.trigger.type.required}")
    TriggerType type;

    @Schema(description = "Biểu mẫu dữ liệu đầu vào, bắt buộc khi type = MANUAL")
    @Size(max = 100, message = "{validation.ticketCallFlow.trigger.id.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String inputFormId;

    @Schema(description = "API kích hoạt, bắt buộc khi type = AUTO")
    @Size(max = 100, message = "{validation.ticketCallFlow.trigger.id.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String apiId;

    @Schema(description = "Bắt buộc khi type = SCHEDULE")
    ScheduleType scheduleType;

    @Schema(description = "Ngày chạy (giờ Việt Nam), bắt buộc khi scheduleType = ONCE", example = "2026-10-10")
    LocalDate runDate;

    @Schema(description = "Giờ chạy (giờ Việt Nam), bắt buộc khi type = SCHEDULE", type = "string", example = "08:30")
    LocalTime runTime;

    @Schema(description = "Chu kỳ lặp, bắt buộc khi scheduleType = REPEAT")
    ScheduleRepeat repeat;
}
