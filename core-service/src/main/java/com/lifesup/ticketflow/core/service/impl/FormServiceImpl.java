package com.lifesup.ticketflow.core.service.impl;

import com.lifesup.ticketflow.common.api.PageResponse;
import com.lifesup.ticketflow.core.dto.request.FormSearchRequest;
import com.lifesup.ticketflow.core.dto.response.FormResponse;
import com.lifesup.ticketflow.core.entity.FormEntity;
import com.lifesup.ticketflow.core.entity.FormFieldEntity;
import com.lifesup.ticketflow.core.repository.FormFieldRepository;
import com.lifesup.ticketflow.core.repository.FormRepository;
import com.lifesup.ticketflow.core.service.FormService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.lifesup.ticketflow.core.common.util.QueryUtils.toLikePattern;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FormServiceImpl implements FormService {

    FormRepository formRepository;
    FormFieldRepository formFieldRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<FormResponse> search(FormSearchRequest request) {
        Sort sort = Sort.by(Sort.Order.asc("name"), Sort.Order.asc("id"));
        PageRequest pageable = PageRequest.of(request.getPage() - 1, request.getSize(), sort);
        Page<FormEntity> page = formRepository.search(toLikePattern(request.getKeyword()), pageable);

        // Lấy trường của cả trang trong 1 câu, tránh N+1
        Map<Long, List<FormResponse.Field>> fieldsByForm = page.isEmpty() ? Map.of() : formFieldRepository
                .findByFormIdInOrderByPositionAsc(page.map(FormEntity::getId).getContent()).stream()
                .collect(Collectors.groupingBy(FormFieldEntity::getFormId,
                        Collectors.mapping(FormServiceImpl::toFieldResponse, Collectors.toList())));
        return new PageResponse<>(page.map(form -> toResponse(form, fieldsByForm.getOrDefault(form.getId(), List.of()))));
    }

    private static FormResponse toResponse(FormEntity entity, List<FormResponse.Field> fields) {
        return FormResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .createdAt(entity.getCreatedAt())
                .createdBy(entity.getCreatedBy())
                .updatedAt(entity.getUpdatedAt())
                .updatedBy(entity.getUpdatedBy())
                .rowVersion(entity.getRowVersion())
                .fields(fields)
                .build();
    }

    private static FormResponse.Field toFieldResponse(FormFieldEntity entity) {
        return FormResponse.Field.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .dataType(entity.getDataType())
                .options(entity.getOptions())
                .position(entity.getPosition())
                .required(entity.isRequired())
                .build();
    }
}
