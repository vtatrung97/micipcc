package com.lifesup.ticketflow.engine.workflow.bpmn;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashSet;
import java.util.Set;

/** Chuẩn hóa BPMN id ổn định và xử lý collision. */
public final class BpmnIdNormalizer {
    private final Set<String> used = new HashSet<>();

    /** Tạo BPMN id deterministic từ id gốc. */
    public String normalize(String prefix, String original) {
        String safe = original == null ? "missing" : original.replaceAll("[^A-Za-z0-9_.-]", "_");
        if (safe.isBlank()) safe = "empty";
        String candidate = prefix + safe;
        if (used.add(candidate)) return candidate;
        candidate = candidate + "_" + hash(original == null ? "" : original);
        int suffix = 2;
        while (!used.add(candidate)) candidate = prefix + safe + "_" + hash(original) + "_" + suffix++;
        return candidate;
    }

    private static String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest, 0, 4);
        } catch (NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }
}
