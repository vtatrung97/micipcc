package com.lifesup.ticketflow.core.repository.httpClient;

import com.lifesup.ticketflow.core.dto.response.KeycloakIntrospectionResponse;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.MultivaluedMap;

/**
 * Endpoint introspection của Keycloak, khai báo theo cùng kiểu với
 * {@link org.keycloak.admin.client.token.TokenService} (TokenService chưa có sẵn endpoint này).
 */
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_FORM_URLENCODED)
public interface KeycloakTokenIntrospectionClient {

    @POST
    @Path("/realms/{realm}/protocol/openid-connect/token/introspect")
    KeycloakIntrospectionResponse introspect(@PathParam("realm") String realm, MultivaluedMap<String, String> form);
}
