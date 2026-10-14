package com.lifesup.ticketflow.core.consumer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.common.dto.CdcEvent;
import com.lifesup.ticketflow.core.dto.request.KeycloakGroupDto;
import com.lifesup.ticketflow.core.service.KeycloakGroupService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;

import java.io.IOException;
import java.util.function.Consumer;

/** CDC ipcc_account.keycloak_group → keycloak_group (giống KeycloakGroupCdc của IPCC). */
@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KeycloakGroupCdcConsumer {

    private static final TypeReference<CdcEvent<KeycloakGroupDto>> EVENT_TYPE = new TypeReference<>() {
    };

    KeycloakGroupService keycloakGroupService;
    ObjectMapper objectMapper;

    @Bean
    public Consumer<Message<?>> keycloakGroupCdc() {
        return message -> {
            if (!(message.getPayload() instanceof byte[] payload) || payload.length == 0) {
                return;
            }
            CdcEvent<KeycloakGroupDto> event;
            try {
                event = objectMapper.readValue(payload, EVENT_TYPE);
            } catch (IOException e) {
                throw new IllegalStateException("Cannot parse keycloak group CDC event", e);
            }
            KeycloakGroupDto before = event.getBefore();
            KeycloakGroupDto after = event.getAfter();
            log.info("Received keycloak group CDC event: op={}, before={}, after={}", event.getOp(), before, after);

            // Snapshot (r) có thể chạy lại nhiều lần → saveOrUpdate cho cả c/r/u để idempotent
            if (after != null && (event.isCreateOp() || event.isReadOp() || event.isUpdateOp())) {
                keycloakGroupService.saveOrUpdate(after, event.isUpdateOp());
            } else if (before != null && event.isDeleteOp()) {
                keycloakGroupService.delete(before);
            }
        };
    }
}
