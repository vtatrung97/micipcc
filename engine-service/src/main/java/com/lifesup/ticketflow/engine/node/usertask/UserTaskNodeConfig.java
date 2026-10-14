package com.lifesup.ticketflow.engine.node.usertask;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.lifesup.ticketflow.engine.workflow.NodeConfig;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** USER_TASK: giao việc cho người xử lý, kèm form nhập liệu và thời hạn xử lý. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserTaskNodeConfig implements NodeConfig {
    AssignType assignType;
    /** Bắt buộc khi assignType = AUTO. */
    AssignStrategy assignStrategy;
    /** Phòng ban xử lý, lưu vào category của task để lọc. */
    String departmentId;
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<String> groupIds = new ArrayList<>();
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<String> agentIds = new ArrayList<>();
    Integer slaValue;
    SlaUnit slaUnit;
    /** Cảnh báo khi quá hạn; engine chỉ gán dueDate, việc cảnh báo do bên theo dõi SLA thực hiện. */
    boolean slaWarning;
    /** Form hiển thị cho người xử lý, ghi vào formKey của task. */
    String formId;
    /** Điền sẵn form: giá trị biến → field của form. */
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<Input> inputs = new ArrayList<>();
    /** Khi hoàn thành: field của form → biến. */
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<Output> outputs = new ArrayList<>();

    /** Điền sẵn field {@code formField} của form bằng giá trị biến {@code variable}. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Input {
        String variable;
        String formField;
    }

    /** Ghi giá trị field {@code formField} của form vào biến {@code variable} khi hoàn thành task. */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Output {
        String formField;
        String variable;
        String displayName;
    }

    public enum AssignType {
        /** Giao cho nhóm / danh sách người, người xử lý tự nhận việc. */
        MANUAL,
        /** Hệ thống tự chọn một người theo {@link AssignStrategy}. */
        AUTO
    }

    public enum AssignStrategy {
        /** Lần lượt theo danh sách người xử lý của node. */
        ROUND_ROBIN
    }

    /**
     * Đơn vị thời hạn xử lý (SLA), tính theo lịch thường (1 ngày = 24 giờ), chưa trừ ngày nghỉ.
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

        /** Nhận mã (không phân biệt hoa thường) hoặc nhãn; giá trị khác báo lỗi để mapper trả lỗi cấu hình. */
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

        public Duration toDuration(long amount) {
            return switch (this) {
                case MINUTE -> Duration.ofMinutes(amount);
                case HOUR -> Duration.ofHours(amount);
                case DAY -> Duration.ofDays(amount);
                case WEEK -> Duration.ofDays(amount * 7);
            };
        }
    }
}
