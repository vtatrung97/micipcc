package com.lifesup.ticketflow.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CdcEvent<T> implements Serializable {
    T before;
    T after;
    String op;
    @JsonProperty("ts_ms")
    long tsMs;

    public boolean isCreateOp() {
        return "c".equals(op);
    }

    public boolean isReadOp() {
        return "r".equals(op);
    }

    public boolean isUpdateOp() {
        return "u".equals(op);
    }

    public boolean isDeleteOp() {
        return "d".equals(op);
    }
}
