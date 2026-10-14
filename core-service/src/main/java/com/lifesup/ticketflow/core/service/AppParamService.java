package com.lifesup.ticketflow.core.service;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.AppParamCreateRequest;
import com.lifesup.ticketflow.core.dto.request.AppParamSearchRequest;
import com.lifesup.ticketflow.core.dto.response.AppParamResponse;

public interface AppParamService {

    /** Tìm theo type (tuyệt đối) và tên (tương đối), sắp theo tên tăng dần. */
    PageResponse<AppParamResponse> search(AppParamSearchRequest request);

    /** Tạo mới, không truyền code thì sinh từ name; code trùng trong cùng type → 2014. */
    AppParamResponse create(AppParamCreateRequest request);
}
