package com.lifesup.ticketflow.engine.common.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import java.time.Duration;
import java.util.Arrays;

/**
 * Đơn vị thời hạn xử lý (SLA). Tính theo lịch thường (1 ngày = 24 giờ), chưa trừ ngày nghỉ.
 *
 * <p>FE hiện gửi nhãn tiếng Việt ("Giờ", "Ngày"...). Tạm nhận cả nhãn lẫn mã cho tới khi FE chuyển hẳn sang mã;
 * khi ghi lại (tf:config) luôn dùng mã.
 */
public enum SlaUnit {
    MINUTE("Phút"),
    HOUR("Giờ"),
    DAY("Ngày"),
    WEEK("Tuần");

    private final String label;

    SlaUnit(String label) {
        this.label = label;
    }

    /** Nhận mã (không phân biệt hoa thường) hoặc nhãn tiếng Việt; giá trị khác báo lỗi để mapper trả lỗi cấu hình. */
    @JsonCreator
    public static SlaUnit from(String value) {
        if (value == null) {
            return null;
        }
        String text = value.trim();
        return Arrays.stream(values())
                .filter(unit -> unit.name().equalsIgnoreCase(text) || unit.label.equalsIgnoreCase(text))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unsupported SLA unit: " + value));
    }

    /** Độ dài của {@code amount} đơn vị. */
    public Duration toDuration(long amount) {
        return switch (this) {
            case MINUTE -> Duration.ofMinutes(amount);
            case HOUR -> Duration.ofHours(amount);
            case DAY -> Duration.ofDays(amount);
            case WEEK -> Duration.ofDays(amount * 7);
        };
    }
}
