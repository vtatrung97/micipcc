package com.lifesup.ticketflow.engine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class EngineServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EngineServiceApplication.class, args);
    }
}
