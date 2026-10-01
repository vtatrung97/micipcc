# Common Auth

Shared authentication building blocks for Ticket Flow services:

- Spring Boot auto-configuration for stateless OAuth2 Resource Server security
- Keycloak access-token/RPT JWT validation through Spring Security
- Keycloak realm/client-role conversion
- Security-context utilities
- API-key support for legacy service-to-service callers
- Resource/scope authorization building blocks

Add `common-auth` to a service and configure the standard Spring Resource Server issuer, JWK set and audience
properties. The library then creates the stateless filter chain and exposes the validated JWT/RPT through
`SecurityContextHolder` and `SecurityContextUtils`.

The removed Keycloak Spring and Spring Boot adapters are intentionally not used. RPT validation does not require
`keycloak-admin-client`; that dependency is retained temporarily for the existing login client and will be separated
from request authentication.

Login endpoints and service-specific authorization rules remain in the owning service.
