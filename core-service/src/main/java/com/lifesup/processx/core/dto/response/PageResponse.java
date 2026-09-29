package com.lifesup.processx.core.dto.response;

import lombok.Data;
import org.springframework.data.domain.Page;

import java.util.List;

/** Kết quả phân trang, page bắt đầu từ 1. */
@Data
public class PageResponse<T> {
    private List<T> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean first;
    private boolean last;

    public PageResponse(Page<T> pageData) {
        this.content = pageData.getContent();
        this.page = pageData.getNumber() + 1;
        this.size = pageData.getSize();
        this.totalElements = pageData.getTotalElements();
        this.totalPages = pageData.getTotalPages();
        this.first = pageData.isFirst();
        this.last = pageData.isLast();
    }
}
