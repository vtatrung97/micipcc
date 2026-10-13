package com.lifesup.ticketflow.engine.bpmn;

import java.util.List;
import java.util.Optional;
import org.flowable.bpmn.model.BaseElement;
import org.flowable.bpmn.model.ExtensionElement;

/** Ghi / đọc phần mở rộng tf:* (nội dung text) trên phần tử BPMN. */
public final class BpmnExtensions {

    private BpmnExtensions() {
    }

    public static void put(BaseElement element, String name, String text) {
        ExtensionElement extension = new ExtensionElement();
        extension.setNamespace(BpmnConstants.NAMESPACE);
        extension.setNamespacePrefix(BpmnConstants.NAMESPACE_PREFIX);
        extension.setName(name);
        extension.setElementText(text);
        element.addExtensionElement(extension);
    }

    public static Optional<String> read(BaseElement element, String name) {
        List<ExtensionElement> extensions = element.getExtensionElements().getOrDefault(name, List.of());
        return extensions.stream()
                .filter(extension -> BpmnConstants.NAMESPACE.equals(extension.getNamespace()))
                .map(ExtensionElement::getElementText)
                .findFirst();
    }
}
