package com.lifesup.ticketflow.integration.service;

import com.lifesup.ticketflow.integration.dto.request.ConnectionTestRequest;
import com.lifesup.ticketflow.integration.dto.response.ConnectionTestResponse;

/** Test kết nối: chỉ kiểm tra DNS / TCP / TLS / HTTP tới endpoint gốc, không gọi API nghiệp vụ, không dùng secret. */
public interface ConnectionTestService {

    /** Test connection đã lưu. */
    ConnectionTestResponse test(Long connectionId);

    /** Test dữ liệu trên form, chưa lưu. */
    ConnectionTestResponse test(ConnectionTestRequest request);
}
