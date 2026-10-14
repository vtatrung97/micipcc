package com.lifesup.ticketflow.core.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class KeycloakGroupSearchRequest {

    /** Tìm tương đối theo tên group, trống = tất cả. */
    String name;

    /** Realm Keycloak, trống = mọi realm. */
    String realmName;

    /** Bắt đầu từ 1. */
    @Min(1)
    int page = 1;
    @Min(1)
    @Max(100)
    int size = 20;
}
