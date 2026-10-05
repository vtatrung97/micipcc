package com.lifesup.ticketflow.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/** Shared authentication settings used by every Ticket Flow backend service. Keycloak settings come from keycloak.config.*. */
@ConfigurationProperties(prefix = "ticket-flow.auth")
public class CommonAuthProperties {

    private boolean enabled = true;
    private List<String> publicPaths = new ArrayList<>();

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public List<String> getPublicPaths() {
        return publicPaths;
    }

    public void setPublicPaths(List<String> publicPaths) {
        this.publicPaths = publicPaths == null ? new ArrayList<>() : new ArrayList<>(publicPaths);
    }
}
