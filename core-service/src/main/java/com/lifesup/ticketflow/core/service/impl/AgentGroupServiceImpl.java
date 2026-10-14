package com.lifesup.ticketflow.core.service.impl;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.AgentGroupSearchRequest;
import com.lifesup.ticketflow.core.dto.response.AgentGroupResponse;
import com.lifesup.ticketflow.core.repository.AgentGroupRepository;
import com.lifesup.ticketflow.core.service.AgentGroupService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.lifesup.ticketflow.core.common.util.QueryUtils.toLikePattern;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AgentGroupServiceImpl implements AgentGroupService {

    AgentGroupRepository agentGroupRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AgentGroupResponse> search(AgentGroupSearchRequest request) {
        Sort sort = Sort.by(Sort.Order.asc("agentGroupName"), Sort.Order.asc("agentGroupId"));
        PageRequest pageable = PageRequest.of(request.getPage() - 1, request.getSize(), sort);
        return new PageResponse<>(agentGroupRepository.search(toLikePattern(request.getAgentGroupName()), pageable));
    }
}
