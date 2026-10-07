package com.lifesup.ticketflow.integration.service.impl;

import com.lifesup.ticketflow.integration.dto.response.OperationSummaryResponse;
import com.lifesup.ticketflow.integration.repository.OperationRepository;
import com.lifesup.ticketflow.integration.service.OperationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OperationServiceImpl implements OperationService {

    OperationRepository operationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OperationSummaryResponse> search(String keyword) {
        Sort sort = Sort.by(Sort.Order.asc("name"), Sort.Order.desc("versionNo"), Sort.Order.asc("id"));
        return operationRepository.search(toLikePattern(keyword), sort);
    }

    private static String toLikePattern(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return null;
        }
        String escaped = keyword.trim().replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
        return "%" + escaped + "%";
    }
}
