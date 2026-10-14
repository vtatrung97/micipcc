package com.lifesup.ticketflow.engine.dto.canvas.model;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Một biến khởi tạo ở START. Giá trị lấy theo thứ tự ưu tiên:
 * {@code value} cố định → {@code formField} trong dữ liệu form → {@code apiField} trong payload API.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StartVariable {
    /** Tên biến trong quy trình. */
    String name;
    /** Field của form nhập liệu (kích hoạt MANUAL / HYBRID, hoặc quy trình cha truyền vào). */
    String formField;
    /** Field trong payload của API kích hoạt (AUTO / HYBRID). */
    String apiField;
    /** Giá trị cố định, có thì bỏ qua formField / apiField. */
    String value;
    /** Tên hiển thị, chỉ phục vụ FE. */
    String displayName;
}
