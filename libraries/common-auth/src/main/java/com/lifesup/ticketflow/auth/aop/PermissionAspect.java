package com.lifesup.ticketflow.auth.aop;

import com.lifesup.ticketflow.auth.util.SecurityContextUtils;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.lang.reflect.Method;

@Aspect
@Component
public class PermissionAspect {

    @Before("@annotation(CheckPermission)")
    public void beforeCheckPermission(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        CheckPermission checkPermission = method.getAnnotation(CheckPermission.class);
        String resourceName = checkPermission.resourceName();
        String scope = checkPermission.scope();

        if (StringUtils.hasText(resourceName)
                && !SecurityContextUtils.checkPermission(resourceName, scope)) {
            throw new AccessDeniedException("Permission denied");
        }
    }

    @Before("@annotation(CheckScopePermission)")
    public void beforeCheckScopePermission(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        CheckScopePermission checkScopePermission =
                method.getAnnotation(CheckScopePermission.class);
        String scope = checkScopePermission.scope();

        if (StringUtils.hasText(scope)
                && !SecurityContextUtils.checkScopePermission(scope)) {
            throw new AccessDeniedException("Permission denied");
        }
    }
}
