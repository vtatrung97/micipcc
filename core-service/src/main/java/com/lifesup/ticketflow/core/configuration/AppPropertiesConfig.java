package com.lifesup.ticketflow.core.configuration;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({AppProperties.class, KeycloakAdminClientProperties.class})
public class AppPropertiesConfig {}
