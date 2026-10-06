# Common Auth

Shared authentication building blocks for Ticket Flow services, following the IPCC Keycloak setup:

- `PathBasedConfigResolver`: loads the Keycloak adapter config (realm, resource, credentials, policy-enforcer paths)
  from MinIO, `keycloak-adapter-config/<realm>/<spring.application.name>.json`, once per realm, and caches it.
  The realm comes from the `x-ipcc2-realm` header, or else from the first label of the request host.
- `KeycloakAuthenticationManagerResolver`: validates the bearer JWT against the realm of that config (JWKS + issuer).
- `PolicyEnforcerFilter`: Keycloak policy enforcer (`keycloak-policy-enforcer`) for resource/scope permissions.
- `PermissionAspect`: `@CheckPermission` / `@CheckScopePermission` against the RPT of the policy enforcer.
- Security-context utilities, API-key support.

Configuration:

```properties
keycloak.config.resolver=path
keycloak.config.auth-server-url=${KEYCLOAK_AUTH_SERVER_URL:}   # overrides auth-server-url of the file
minio.baseUrl=${MINIO_BASE_URL:}
minio.accessKey=${MINIO_ACCESS_KEY:}
minio.secretKey=${MINIO_SECRET_KEY:}
ticket-flow.auth.public-paths=/api/v1/health-check,...
```
