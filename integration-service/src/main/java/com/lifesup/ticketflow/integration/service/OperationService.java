package com.lifesup.ticketflow.integration.service;

import com.lifesup.ticketflow.integration.dto.response.OperationSummaryResponse;

import java.util.List;

public interface OperationService {

    List<OperationSummaryResponse> search(String keyword);
}
