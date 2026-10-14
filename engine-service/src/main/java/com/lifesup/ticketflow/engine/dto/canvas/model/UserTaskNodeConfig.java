package com.lifesup.ticketflow.engine.dto.canvas.model;

import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import com.lifesup.ticketflow.engine.common.enums.AssignStrategy;
import com.lifesup.ticketflow.engine.common.enums.AssignType;
import com.lifesup.ticketflow.engine.common.enums.SlaUnit;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/** USER_TASK: giao việc cho người xử lý, kèm form nhập liệu và thời hạn xử lý. */
@Data
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public final class UserTaskNodeConfig implements NodeConfig {
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
    /** Cảnh báo khi quá hạn; engine chỉ ghi nhận, việc cảnh báo do bên theo dõi SLA thực hiện theo dueDate. */
    boolean slaWarning;
    /** Form hiển thị cho người xử lý, ghi vào formKey của task. */
    String formId;
    /** Điền sẵn form: giá trị biến → field của form. */
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<FormInputMapping> inputs = new ArrayList<>();
    /** Khi hoàn thành: field của form → biến. */
    @JsonSetter(nulls = Nulls.AS_EMPTY)
    List<FormOutputMapping> outputs = new ArrayList<>();
}
