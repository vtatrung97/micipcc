package com.lifesup.ticketflow.core.consumer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifesup.ticketflow.common.dto.CdcEvent;
import com.lifesup.ticketflow.core.dto.request.AccountUserDto;
import com.lifesup.ticketflow.core.service.AgentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;

import java.io.IOException;
import java.util.function.Consumer;


@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AccountUserEventCdcConsumer {

    private static final TypeReference<CdcEvent<AccountUserDto>> EVENT_TYPE = new TypeReference<>() {
    };

    AgentService agentService;
    ObjectMapper objectMapper;

    @Bean
    public Consumer<Message<?>> accountUserEventCdc() {
        return message -> {
            if (!(message.getPayload() instanceof byte[] payload) || payload.length == 0) {
                return;
            }
            CdcEvent<AccountUserDto> event;
            try {
                event = objectMapper.readValue(payload, EVENT_TYPE);
            } catch (IOException e) {
                throw new IllegalStateException("Cannot parse account user CDC event", e);
            }
            AccountUserDto before = event.getBefore();
            AccountUserDto after = event.getAfter();
            log.info("Received account user CDC event: op={}, before={}, after={}", event.getOp(), before, after);

            // Snapshot (r) có thể chạy lại nhiều lần → dùng saveOrUpdate cho cả c/r/u để idempotent
            if (after != null && (event.isCreateOp() || event.isReadOp() || event.isUpdateOp())) {
                agentService.saveOrUpdateAgent(after);
            } else if (before != null && event.isDeleteOp()) {
                agentService.deleteAgent(before);
            }
        };
    }
}
