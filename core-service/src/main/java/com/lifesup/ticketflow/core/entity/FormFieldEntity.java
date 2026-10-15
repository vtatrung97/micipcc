package com.lifesup.ticketflow.core.entity;

import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.List;

/** Bảng form_field: trường của biểu mẫu, lưu / xoá cùng biểu mẫu nên không có audit, xoá mềm. */
@Getter
@Setter
@Entity
@Table(name = "form_field")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FormFieldEntity {

    @Id
    @Tsid
    Long id;

    /** form.id */
    @Column(name = "form_id", nullable = false, updatable = false)
    Long formId;

    @Column(name = "code", nullable = false, length = 100)
    String code;

    @Column(name = "name", nullable = false)
    String name;

    /** VD TEXTBOX, COMBOBOX_SINGLE, COMBOBOX_MULTI. */
    @Column(name = "data_type", nullable = false, length = 50)
    String dataType;

    /** Danh sách lựa chọn riêng của trường, lưu JSON array. */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "options", columnDefinition = "longtext")
    List<String> options;

    @Column(name = "position", nullable = false)
    Integer position;

    @Column(name = "required", nullable = false)
    boolean required;
}
