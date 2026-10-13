package com.lifesup.ticketflow.engine.workflow.bpmn;

import java.util.List;
import java.util.Optional;
import org.flowable.bpmn.model.BaseElement;
import org.flowable.bpmn.model.ExtensionElement;

/** Phần mở rộng tf:* (nội dung text) mà engine ghi vào phần tử BPMN. */
public final class BpmnExtensions {
    public static final String NAMESPACE = "https://lifesup.com/ticket-flow";
    public static final String NAMESPACE_PREFIX = "tf";
    /** tf:config: cấu hình node dạng JSON, bean runtime đọc lại theo id phần tử. */
    public static final String CONFIG = "config";

    private BpmnExtensions() {
    }

    public static void put(BaseElement element, String name, String text) {
        ExtensionElement extension = new ExtensionElement();
        extension.setNamespace(NAMESPACE);
        extension.setNamespacePrefix(NAMESPACE_PREFIX);
        extension.setName(name);
        extension.setElementText(text);
        element.addExtensionElement(extension);
    }

    public static Optional<String> read(BaseElement element, String name) {
        List<ExtensionElement> extensions = element.getExtensionElements().getOrDefault(name, List.of());
        return extensions.stream()
                .filter(extension -> NAMESPACE.equals(extension.getNamespace()))
                .map(ExtensionElement::getElementText)
                .findFirst();
    }
}
