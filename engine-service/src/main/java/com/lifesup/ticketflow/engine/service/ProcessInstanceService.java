package com.lifesup.ticketflow.engine.service;

import com.lifesup.ticketflow.engine.dto.request.CancelInstanceRequest;
import com.lifesup.ticketflow.engine.dto.request.StartInstanceRequest;
import com.lifesup.ticketflow.engine.dto.response.ProcessInstanceResponse;

/** Khởi tạo, tra cứu, huỷ phiên chạy quy trình. */
public interface ProcessInstanceService {

    ProcessInstanceResponse start(StartInstanceRequest request);

    ProcessInstanceResponse get(String processInstanceId);

    void cancel(String processInstanceId, CancelInstanceRequest request);
}
