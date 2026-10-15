package com.lifesup.ticketflow.core.service;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.FormSearchRequest;
import com.lifesup.ticketflow.core.dto.response.FormResponse;

public interface FormService {

    /** Tìm biểu mẫu chưa xoá theo mã / tên / tiêu đề (tương đối), kèm danh sách trường; sắp theo tên. */
    PageResponse<FormResponse> search(FormSearchRequest request);
}
