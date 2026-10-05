package com.lifesup.ticketflow.auth.aop;

import com.lifesup.ticketflow.auth.util.SecurityContextUtils;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.util.StringUtils;

import java.lang.reflect.Method;

/** Checks @CheckPermission / @CheckScopePermission against the Keycloak permissions of the request. Registered by CommonAuthAutoConfiguration. */
@Slf4j
@Aspect
public class PermissionAspect {

    @Before("@annotation(com.lifesup.ticketflow.auth.aop.CheckPermission)")
    public void beforeCheckPermission(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        CheckPermission checkPermission = method.getAnnotation(CheckPermission.class);
        String resourceName = checkPermission.resourceName();
        String scope = checkPermission.scope();

        if (StringUtils.hasText(resourceName)
                && !SecurityContextUtils.checkPermission(resourceName, scope)) {
            log.warn("Permission denied: resource {}, scope {} on {}", resourceName, scope, method.getName());
            throw new AccessDeniedException("Permission denied");
        }
    }

    @Before("@annotation(com.lifesup.ticketflow.auth.aop.CheckScopePermission)")
    public void beforeCheckScopePermission(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        CheckScopePermission checkScopePermission =
                method.getAnnotation(CheckScopePermission.class);
        String scope = checkScopePermission.scope();

        if (StringUtils.hasText(scope)
                && !SecurityContextUtils.checkScopePermission(scope)) {
            log.warn("Permission denied: scope {} on {}", scope, method.getName());
            throw new AccessDeniedException("Permission denied");
        }
    }
}
