package com.lifesup.ticketflow.auth.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.representations.adapters.config.PolicyEnforcerConfig;
import org.keycloak.util.JsonSerialization;
import org.springframework.util.StringUtils;

import java.io.InputStream;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Resolves the Keycloak config (realm, client, credentials, policy-enforcer paths), like the IPCC
 * PathBasedConfigResolver: loads {@code <realm>/<spring.application.name>.json} from the MinIO bucket
 * {@value #MINIO_BUCKET} once per realm and caches it.
 *
 * <p>The realm comes from the {@value #REALM_HEADER} header, or else from the first label of the request host
 * (e.g. {@code realm1.example.com} -> {@code realm1}).
 *
 * <p>{@code keycloak.config.auth-server-url}, when set, overrides the auth-server-url of the file.
 * The returned instance is cached: PolicyEnforcerFilter and KeycloakAuthenticationManagerResolver key
 * their objects by config identity.
 */
@Slf4j
public class PathBasedConfigResolver {

    private static final String MINIO_BUCKET = "keycloak-adapter-config";
    private static final String REALM_HEADER = "x-ipcc2-realm";

    private final MinioClient minioClient;
    private final String applicationName;
    private final String authServerUrl;
    private final ConcurrentHashMap<String, PolicyEnforcerConfig> cache = new ConcurrentHashMap<>();

    public PathBasedConfigResolver(MinioClient minioClient, String applicationName, String authServerUrl) {
        this.minioClient = minioClient;
        this.applicationName = applicationName;
        this.authServerUrl = authServerUrl;
    }

    public PolicyEnforcerConfig resolve(HttpServletRequest request) {
        return cache.computeIfAbsent(getRealmFromRequest(request), this::load);
    }

    private String getRealmFromRequest(HttpServletRequest request) {
        String realm = request.getHeader(REALM_HEADER);
        if (StringUtils.hasText(realm)) {
            return realm.trim();
        }

        String host = request.getServerName();
        if (host != null && host.startsWith("www.")) {
            host = host.substring(4);
        }
        if (host == null || !host.contains(".")) {
            throw new IllegalStateException("Unable to resolve realm from the request headers or request host");
        }
        return host.substring(0, host.indexOf('.'));
    }

    private PolicyEnforcerConfig load(String realm) {
        String clientObject = String.format("%s/%s.json", realm, applicationName);
        log.info("Cache miss, load keycloak adapter config from minio/{}/{}", MINIO_BUCKET, clientObject);

        PolicyEnforcerConfig config;
        try (InputStream is = minioClient.getObject(GetObjectArgs.builder().bucket(MINIO_BUCKET).object(clientObject).build())) {
            config = toPolicyEnforcerConfig(JsonSerialization.mapper.readTree(is));
        } catch (Exception e) {
            throw new IllegalStateException(String.format("Unable to load: %s/%s", MINIO_BUCKET, clientObject), e);
        }

        if (StringUtils.hasText(authServerUrl)) {
            config.setAuthServerUrl(authServerUrl);
        }
        if (!StringUtils.hasText(config.getAuthServerUrl()) || !StringUtils.hasText(config.getRealm())
                || !StringUtils.hasText(config.getResource())) {
            throw new IllegalStateException(String.format(
                    "auth-server-url, realm and resource are required in: %s/%s", MINIO_BUCKET, clientObject));
        }
        log.info("Loaded keycloak config: auth-server-url={}, realm={}, resource={}",
                config.getAuthServerUrl(), config.getRealm(), config.getResource());
        return config;
    }

    private static PolicyEnforcerConfig toPolicyEnforcerConfig(JsonNode root) throws Exception {
        ObjectMapper mapper = JsonSerialization.mapper;
        JsonNode enforcerNode = root.get("policy-enforcer");
        if (enforcerNode == null) {
            return mapper.treeToValue(root, PolicyEnforcerConfig.class);
        }

        // Legacy adapter format: lift the connection settings into the nested policy-enforcer object
        ObjectNode merged = ((ObjectNode) enforcerNode).deepCopy();
        for (String field : new String[] {"realm", "auth-server-url", "resource", "credentials"}) {
            if (root.has(field) && !merged.has(field)) {
                merged.set(field, root.get(field));
            }
        }
        return mapper.treeToValue(merged, PolicyEnforcerConfig.class);
    }
}
