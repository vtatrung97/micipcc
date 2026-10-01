package com.lifesup.ticketflow.core.service.impl;

import com.lifesup.ticketflow.core.dto.request.AccountUserDto;
import com.lifesup.ticketflow.core.entity.UserAccountEntity;
import com.lifesup.ticketflow.core.repository.UserAccountRepository;
import com.lifesup.ticketflow.core.service.AgentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AgentServiceImpl implements AgentService {

    UserAccountRepository userAccountRepository;

    @Override
    @Transactional
    public void saveOrUpdateAgent(AccountUserDto userDto) {
        UserAccountEntity agents = userAccountRepository.findByKeycloakId(userDto.getId());
        if (agents != null) {
            agents.setUsername(userDto.getUsername());
            agents.setKzUserId(userDto.getKzUserId());
            agents.setKzAccountId(userDto.getKzAccountId());
            agents.setRealm(userDto.getRealm());
            agents.setEmail(userDto.getEmail());
            agents.setStatus(userDto.isEnabled() ? UserAccountEntity.Status.ACTIVE.value : UserAccountEntity.Status.INACTIVE.value);
            agents.setGroupId(userDto.getGroupId());
            agents.setFullName(buildFullName(userDto.getLastName(), userDto.getFirstName()));
            agents.setSyncedAt(Instant.now());
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
        agents.setKzUserId(userDto.getKzUserId());
        agents.setKzAccountId(userDto.getKzAccountId());
        agents.setRealm(userDto.getRealm());
        agents.setEmail(userDto.getEmail());
        agents.setStatus(userDto.isEnabled() ? UserAccountEntity.Status.ACTIVE.value : UserAccountEntity.Status.INACTIVE.value);
        agents.setGroupId(userDto.getGroupId());
        agents.setFullName(buildFullName(userDto.getLastName(), userDto.getFirstName()));
        agents.setSyncedAt(Instant.now());
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
