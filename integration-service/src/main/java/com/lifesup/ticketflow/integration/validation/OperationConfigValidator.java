package com.lifesup.ticketflow.integration.validation;

import com.dashjoin.jsonata.Jsonata;
import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.integration.common.exception.IntegrationErrorCode;
import com.lifesup.ticketflow.integration.dto.request.OperationDefinition;
import com.lifesup.ticketflow.integration.dto.request.OperationInputParam;
import com.lifesup.ticketflow.integration.dto.request.OperationOutputParam;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Kiểm tra định nghĩa API ngoài phần annotation của DTO: path, header xác thực, biểu thức JSONata,
 * tham số trùng tên và biến {name} trên path.
 */
@Component
public class OperationConfigValidator {

    /** Header xác thực gắn từ connection (secret được mã hoá), không khai báo dạng rõ ở API. */
    static final Set<String> FORBIDDEN_HEADERS = Set.of("authorization", "proxy-authorization", "cookie", "x-api-key");

    /** Biến {tenBien} trên path. */
    static final Pattern PATH_VARIABLE = Pattern.compile("\\{([A-Za-z_][A-Za-z0-9_]*)}");

    public void validate(OperationDefinition definition) {
        validatePath(definition.getPath(), definition.getInputParams());
        validateHeaders(definition.getHeaders());
        validateMapping(definition.getRequestMapping(), "requestMapping");
        validateMapping(definition.getResponseMapping(), "responseMapping");
        checkUniqueNames(definition.getInputParams(), OperationInputParam::getName,
                IntegrationErrorCode.OPERATION_INPUT_PARAMS_INVALID, "inputParams");
        checkUniqueNames(definition.getOutputParams(), OperationOutputParam::getName,
                IntegrationErrorCode.OPERATION_OUTPUT_PARAMS_INVALID, "outputParams");
    }

    /** Path bắt đầu bằng /, không có query; mỗi biến {name} phải là tham số đầu vào bắt buộc. */
    void validatePath(String path, List<OperationInputParam> inputParams) {
        if (!path.startsWith("/") || path.contains("?") || path.contains("://")) {
            throw new AppException(IntegrationErrorCode.OPERATION_PATH_INVALID);
        }
        Matcher matcher = PATH_VARIABLE.matcher(path);
        while (matcher.find()) {
            String name = matcher.group(1);
            boolean declared = inputParams != null && inputParams.stream()
                    .anyMatch(param -> name.equals(param.getName()) && param.isRequired());
            if (!declared) {
                throw AppException.withArgs(IntegrationErrorCode.OPERATION_INPUT_PARAMS_INVALID, "path: {" + name + "}");
            }
        }
    }

    void validateHeaders(Map<String, String> headers) {
        if (headers == null) {
            return;
        }
        for (String name : headers.keySet()) {
            if (FORBIDDEN_HEADERS.contains(name.toLowerCase(Locale.ROOT))) {
                throw AppException.withArgs(IntegrationErrorCode.OPERATION_HEADER_NOT_ALLOWED, name);
            }
        }
    }

    /** Biểu thức JSONata phải parse được (chưa chạy thử với dữ liệu). */
    void validateMapping(String expression, String field) {
        if (!StringUtils.hasText(expression)) {
            return;
        }
        try {
            Jsonata.jsonata(expression);
        } catch (RuntimeException e) {
            throw AppException.withArgs(IntegrationErrorCode.OPERATION_MAPPING_INVALID, field);
        }
    }

    private static <T> void checkUniqueNames(
            List<T> params, Function<T, String> name, IntegrationErrorCode error, String field) {
        if (params == null) {
            return;
        }
        Set<String> names = new HashSet<>();
        for (int i = 0; i < params.size(); i++) {
            if (!names.add(name.apply(params.get(i)))) {
                throw AppException.withArgs(error, field + "[" + i + "].name");
            }
        }
    }
}
