package com.lifesup.ticketflow.engine.dto.canvas;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** Trạng thái viewport chỉ phục vụ hiển thị lại trên FE. */
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CanvasViewport {
    double zoom;
    double x;
    double y;
}
