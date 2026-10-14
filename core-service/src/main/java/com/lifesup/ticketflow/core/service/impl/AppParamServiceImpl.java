package com.lifesup.ticketflow.core.service.impl;

import com.lifesup.ticketflow.auth.util.SecurityContextUtils;
import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.common.exception.AppException;
import com.lifesup.ticketflow.core.common.exception.CoreErrorCode;
import com.lifesup.ticketflow.core.dto.request.AppParamCreateRequest;
import com.lifesup.ticketflow.core.dto.request.AppParamSearchRequest;
import com.lifesup.ticketflow.core.dto.response.AppParamResponse;
import com.lifesup.ticketflow.core.entity.AppParamEntity;
import com.lifesup.ticketflow.core.repository.AppParamRepository;
import com.lifesup.ticketflow.core.service.AppParamService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.text.Normalizer;
import java.util.Locale;

import static com.lifesup.ticketflow.core.common.util.QueryUtils.toLikePattern;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AppParamServiceImpl implements AppParamService {

    private static final int CODE_MAX_LENGTH = 100;

    AppParamRepository appParamRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AppParamResponse> search(AppParamSearchRequest request) {
        Sort sort = Sort.by(Sort.Order.asc("name"), Sort.Order.asc("id"));
        PageRequest pageable = PageRequest.of(request.getPage() - 1, request.getSize(), sort);
        return new PageResponse<>(appParamRepository
                .search(request.getType().trim(), toLikePattern(request.getName()), pageable)
                .map(AppParamServiceImpl::toResponse));
    }

    @Override
    @Transactional
    public AppParamResponse create(AppParamCreateRequest request) {
        String code = StringUtils.hasText(request.getCode()) ? request.getCode() : toCode(request.getName());
        if (code.isEmpty()) {
            throw new AppException(CoreErrorCode.APP_PARAM_CODE_INVALID);
        }
        // ponytail: kiểm trùng ở ứng dụng để trả lỗi rõ ràng; 2 request cùng lúc thì UNIQUE (type, code) của DB chặn
        if (appParamRepository.existsByTypeAndCode(request.getType(), code)) {
            throw AppException.withArgs(CoreErrorCode.APP_PARAM_CODE_EXISTED, code);
        }

        AppParamEntity entity = new AppParamEntity();
        entity.setType(request.getType());
        entity.setCode(code);
        entity.setName(request.getName());
        entity.setStatus(AppParamEntity.STATUS_ACTIVE);
        entity.setRealm(SecurityContextUtils.getRealm());
        appParamRepository.saveAndFlush(entity);
        log.info("Created app_param id={} type={} code={}", entity.getId(), entity.getType(), entity.getCode());
        return toResponse(entity);
    }

    /** "Khiếu nại - Đa phòng ban" → "KHIEU_NAI_DA_PHONG_BAN". */
    static String toCode(String name) {
        String code = Normalizer.normalize(name.replace('đ', 'd').replace('Đ', 'D'), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
        return code.length() > CODE_MAX_LENGTH ? code.substring(0, CODE_MAX_LENGTH) : code;
    }

    private static AppParamResponse toResponse(AppParamEntity entity) {
        return AppParamResponse.builder()
                .id(entity.getId())
                .type(entity.getType())
                .code(entity.getCode())
                .name(entity.getName())
                .status(entity.getStatus())
                .realm(entity.getRealm())
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(entity.getUpdatedBy())
                .build();
    }
}
