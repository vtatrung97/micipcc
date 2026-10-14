package com.lifesup.ticketflow.core.service.impl;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.AccountUserDto;
import com.lifesup.ticketflow.core.dto.request.AgentSearchRequest;
import com.lifesup.ticketflow.core.dto.response.AgentResponse;
import com.lifesup.ticketflow.core.entity.UserAccountEntity;
import com.lifesup.ticketflow.core.repository.UserAccountRepository;
import com.lifesup.ticketflow.core.service.AgentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.lifesup.ticketflow.core.common.util.QueryUtils.toLikePattern;


@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AgentServiceImpl implements AgentService {

    UserAccountRepository userAccountRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AgentResponse> search(AgentSearchRequest request) {
        Sort sort = Sort.by(Sort.Order.asc("username"), Sort.Order.asc("id"));
        PageRequest pageable = PageRequest.of(request.getPage() - 1, request.getSize(), sort);
        return new PageResponse<>(userAccountRepository.search(toLikePattern(request.getUsername()), pageable));
    }

    @Override
    @Transactional
    public void saveOrUpdateAgent(AccountUserDto userDto) {
        UserAccountEntity agents = userAccountRepository.findByKeycloakId(userDto.getId());
        if (agents != null) {
            agents.setUsername(userDto.getUsername());
            agents.setVsaUserLogin(userDto.getUsername());
            agents.setKzUserId(userDto.getKzUserId());
            agents.setKzAccountId(userDto.getKzAccountId());
            agents.setRealm(userDto.getRealm());
            agents.setEmail(userDto.getEmail());
            agents.setStatus(userDto.isEnabled() ? UserAccountEntity.Status.ACTIVE.value : UserAccountEntity.Status.INACTIVE.value);
            agents.setGroupId(userDto.getGroupId());
            agents.setFullName(buildFullName(userDto.getLastName(), userDto.getFirstName()));
            agents.setSyncedAt(System.currentTimeMillis());
            userAccountRepository.save(agents);
        } else {
            createAgent(userDto);
        }
    }

    @Override
    @Transactional
    public void createAgent(AccountUserDto userDto) {
        UserAccountEntity agents = new UserAccountEntity();
        agents.setKeycloakId(userDto.getId());
        agents.setUsername(userDto.getUsername());
        agents.setVsaUserLogin(userDto.getUsername());
        agents.setKzUserId(userDto.getKzUserId());
        agents.setKzAccountId(userDto.getKzAccountId());
        agents.setRealm(userDto.getRealm());
        agents.setEmail(userDto.getEmail());
        agents.setStatus(userDto.isEnabled() ? UserAccountEntity.Status.ACTIVE.value : UserAccountEntity.Status.INACTIVE.value);
        agents.setGroupId(userDto.getGroupId());
        agents.setFullName(buildFullName(userDto.getLastName(), userDto.getFirstName()));
        agents.setSyncedAt(System.currentTimeMillis());
        userAccountRepository.save(agents);
    }

    @Override
    @Transactional
    public void deleteAgent(AccountUserDto userDto) {
        UserAccountEntity agents = userAccountRepository.findByKeycloakId(userDto.getId());
        if (agents != null) {
            userAccountRepository.deleteByKeycloakId(agents.getKeycloakId());
        }
    }

    private String buildFullName(String firstName, String lastName) {
        StringBuilder fullName = new StringBuilder();
        if (firstName != null && !"null".equals(firstName)) {
            fullName.append(firstName);
        }

        if (lastName != null && !"null".equals(lastName)) {
            fullName.append(" ");
            fullName.append(lastName);
        }

        return (fullName.toString().isEmpty() || fullName.toString().isBlank()) ? null : fullName.toString();
    }
}
