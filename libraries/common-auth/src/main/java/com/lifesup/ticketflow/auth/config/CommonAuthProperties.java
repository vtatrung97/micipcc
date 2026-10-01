package com.lifesup.ticketflow.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;
import java.time.Duration;

/** Shared authentication settings used by every Ticket Flow backend service. */
@ConfigurationProperties(prefix = "ticket-flow.auth")
public class CommonAuthProperties {

    private boolean enabled = true;
    private List<String> publicPaths = new ArrayList<>();
    private List<String> roleClients = new ArrayList<>();
    private TokenClient tokenClient = new TokenClient();

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

    public List<String> getRoleClients() {
        return roleClients;
    }

    public void setRoleClients(List<String> roleClients) {
        this.roleClients = roleClients == null ? new ArrayList<>() : new ArrayList<>(roleClients);
    }

    public TokenClient getTokenClient() {
        return tokenClient;
    }

    public void setTokenClient(TokenClient tokenClient) {
        this.tokenClient = tokenClient == null ? new TokenClient() : tokenClient;
    }

    public static class TokenClient {
        private boolean enabled;
        private String authServerUrl;
        private String realm;
        private String clientId;
        private String clientSecret;
        private String audience;
        private Duration connectTimeout = Duration.ofSeconds(3);
        private Duration readTimeout = Duration.ofSeconds(5);

        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public String getAuthServerUrl() { return authServerUrl; }
        public void setAuthServerUrl(String authServerUrl) { this.authServerUrl = authServerUrl; }
        public String getRealm() { return realm; }
        public void setRealm(String realm) { this.realm = realm; }
        public String getClientId() { return clientId; }
        public void setClientId(String clientId) { this.clientId = clientId; }
        public String getClientSecret() { return clientSecret; }
        public void setClientSecret(String clientSecret) { this.clientSecret = clientSecret; }
        public String getAudience() { return audience; }
        public void setAudience(String audience) { this.audience = audience; }
        public Duration getConnectTimeout() { return connectTimeout; }
        public void setConnectTimeout(Duration connectTimeout) { this.connectTimeout = connectTimeout; }
        public Duration getReadTimeout() { return readTimeout; }
        public void setReadTimeout(Duration readTimeout) { this.readTimeout = readTimeout; }
    }
}
