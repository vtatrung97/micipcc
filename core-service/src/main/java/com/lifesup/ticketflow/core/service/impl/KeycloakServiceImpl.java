package com.lifesup.ticketflow.core.service.impl;

import com.lifesup.ticketflow.core.configuration.KeycloakProperties;
import com.lifesup.ticketflow.core.dto.response.KeycloakIntrospectionResponse;
import com.lifesup.ticketflow.core.exception.AppException;
import com.lifesup.ticketflow.core.exception.ErrorCode;
import com.lifesup.ticketflow.core.exception.KeycloakClientException;
import com.lifesup.ticketflow.core.repository.httpClient.KeycloakTokenIntrospectionClient;
import com.lifesup.ticketflow.core.service.KeycloakService;
import jakarta.ws.rs.ProcessingException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Form;
import jakarta.ws.rs.core.Response;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.jboss.resteasy.client.exception.WebApplicationExceptionWrapper;
import org.jboss.resteasy.client.jaxrs.ResteasyClient;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.token.TokenService;
import org.keycloak.representations.AccessToken;
import org.keycloak.representations.AccessTokenResponse;
import org.keycloak.representations.idm.OAuth2ErrorRepresentation;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KeycloakServiceImpl implements KeycloakService {

    KeycloakProperties properties;
    ResteasyClient keycloakResteasyClient;

    @Override
    public AccessTokenResponse login(String username, String password) {
        // Gọi thẳng TokenService (password grant), không tạo đối tượng Keycloak: Keycloak là AutoCloseable
        // nhưng close() sẽ logout luôn session vừa tạo và đóng HTTP client dùng chung
        Form form = clientForm()
                .param(OAuth2Constants.GRANT_TYPE, OAuth2Constants.PASSWORD)
                .param(OAuth2Constants.USERNAME, username)
                .param(OAuth2Constants.PASSWORD, password)
                .param(OAuth2Constants.SCOPE, OAuth2Constants.SCOPE_OPENID);
        return call(() -> tokenService().grantToken(properties.getRealm(), form.asMap()));
    }

    @Override
    public AccessTokenResponse refreshToken(String refreshToken) {
        Form form = clientForm()
                .param(OAuth2Constants.GRANT_TYPE, OAuth2Constants.REFRESH_TOKEN)
                .param(OAuth2Constants.REFRESH_TOKEN, refreshToken);
        return call(() -> tokenService().refreshToken(properties.getRealm(), form.asMap()));
    }

    @Override
    public void logout(String refreshToken) {
        Form form = clientForm().param(OAuth2Constants.REFRESH_TOKEN, refreshToken);
        call(() -> {
            tokenService().logout(properties.getRealm(), form.asMap());
            return null;
        });
    }

    @Override
    public AccessToken verifyToken(String token) {
        Form form = clientForm().param("token", token).param("token_type_hint", OAuth2Constants.ACCESS_TOKEN);
        KeycloakIntrospectionResponse introspection =
                call(() -> introspectionClient().introspect(properties.getRealm(), form.asMap()));
        if (introspection == null || !introspection.isActive()) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        return introspection;
    }

    private TokenService tokenService() {
        return keycloakResteasyClient.target(properties.getAuthServerUrl()).proxy(TokenService.class);
    }

    private KeycloakTokenIntrospectionClient introspectionClient() {
        return keycloakResteasyClient.target(properties.getAuthServerUrl()).proxy(KeycloakTokenIntrospectionClient.class);
    }

    private Form clientForm() {
        Form form = new Form().param(OAuth2Constants.CLIENT_ID, properties.getClientId());
        if (StringUtils.hasText(properties.getClientSecret())) {
            form.param(OAuth2Constants.CLIENT_SECRET, properties.getClientSecret());
        }
        return form;
    }

    /** Chuyển lỗi JAX-RS của thư viện Keycloak thành KeycloakClientException / AppException. */
    private static <T> T call(Supplier<T> request) {
        try {
            return request.get();
        } catch (WebApplicationException e) {
            throw toKeycloakException(e);
        } catch (ProcessingException e) {
            // Timeout, không kết nối được, hoặc lỗi đọc response
            if (e.getCause() instanceof WebApplicationException cause) {
                throw toKeycloakException(cause);
            }
            log.error("Failed to call Keycloak: {}", e.getMessage());
            throw new AppException(ErrorCode.KEYCLOAK_UNAVAILABLE, e);
        }
    }

    private static KeycloakClientException toKeycloakException(WebApplicationException e) {
        Response response = WebApplicationExceptionWrapper.unwrap(e).getResponse();
        OAuth2ErrorRepresentation error = null;
        try {
            if (response.hasEntity()) {
                error = response.readEntity(OAuth2ErrorRepresentation.class);
            }
        } catch (RuntimeException ignored) {
            // Body không phải JSON lỗi OAuth2 (VD trang lỗi của proxy)
        }
        return new KeycloakClientException(
                response.getStatus(),
                error != null ? error.getError() : null,
                error != null ? error.getErrorDescription() : null);
    }
}
