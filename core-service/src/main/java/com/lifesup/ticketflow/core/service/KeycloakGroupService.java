package com.lifesup.ticketflow.core.service;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.KeycloakGroupDto;
import com.lifesup.ticketflow.core.dto.request.KeycloakGroupSearchRequest;
import com.lifesup.ticketflow.core.dto.response.KeycloakGroupResponse;

public interface KeycloakGroupService {

    /** Tìm group theo tên (tương đối), sắp theo tên tăng dần. */
    PageResponse<KeycloakGroupResponse> search(KeycloakGroupSearchRequest request);

    /**
     * Đồng bộ từ CDC: có group cùng id thì cập nhật, chưa có thì tạo mới.
     *
     * @param isUpdate true = event cập nhật, ghi cả update_time / update_by (như IPCC)
     */
    void saveOrUpdate(KeycloakGroupDto dto, boolean isUpdate);

    /** Group bị xoá bên Keycloak: không xoá dòng, đặt status = 0 (như IPCC). */
    void delete(KeycloakGroupDto dto);
}
