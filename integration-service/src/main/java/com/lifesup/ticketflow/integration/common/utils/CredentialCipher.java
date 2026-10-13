package com.lifesup.ticketflow.integration.common.utils;

import com.lifesup.ticketflow.integration.configuration.AppProperties;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Mã hoá / giải mã secret của connection (API key, password, token, client secret) trước khi lưu bảng
 * connection_credential, để DB hoặc bản backup bị lộ cũng không đọc được secret của đối tác.
 * AES-256-GCM với master key CREDENTIAL_MASTER_KEY (base64 của 32 byte, không lưu trong DB);
 * AAD = connection_id nên ciphertext chép sang connection khác sẽ không giải mã được.
 * Key sai định dạng thì service không start. Không log giá trị key / secret.
 */
@Component
public class CredentialCipher {

    /** Phiên bản master key hiện tại, lưu vào connection_credential.key_version để sau này xoay khoá. */
    public static final int KEY_VERSION = 1;

    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int KEY_LENGTH_BYTES = 32;
    private static final int IV_LENGTH_BYTES = 12;
    private static final int TAG_LENGTH_BITS = 128;

    private final SecretKey key;
    private final SecureRandom secureRandom = new SecureRandom();

    public CredentialCipher(AppProperties appProperties) {
        this.key = toKey(appProperties.credential().masterKey());
    }

    /** @return Base64(IV + ciphertext + GCM tag) */
    public String encrypt(long connectionId, String plaintext) {
        byte[] iv = new byte[IV_LENGTH_BYTES];
        secureRandom.nextBytes(iv);
        try {
            byte[] encrypted = newCipher(Cipher.ENCRYPT_MODE, iv, connectionId)
                    .doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            byte[] output = ByteBuffer.allocate(iv.length + encrypted.length).put(iv).put(encrypted).array();
            return Base64.getEncoder().encodeToString(output);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Không mã hoá được secret của connection " + connectionId, e);
        }
    }

    public String decrypt(long connectionId, String ciphertext) {
        ByteBuffer input = ByteBuffer.wrap(Base64.getDecoder().decode(ciphertext));
        byte[] iv = new byte[IV_LENGTH_BYTES];
        input.get(iv);
        byte[] encrypted = new byte[input.remaining()];
        input.get(encrypted);
        try {
            return new String(newCipher(Cipher.DECRYPT_MODE, iv, connectionId).doFinal(encrypted), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Không giải mã được secret của connection " + connectionId, e);
        }
    }

    private Cipher newCipher(int mode, byte[] iv, long connectionId) throws GeneralSecurityException {
        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(mode, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
        cipher.updateAAD(String.valueOf(connectionId).getBytes(StandardCharsets.UTF_8));
        return cipher;
    }

    private static SecretKey toKey(String base64) {
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(base64.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("CREDENTIAL_MASTER_KEY không phải base64 hợp lệ");
        }
        if (bytes.length != KEY_LENGTH_BYTES) {
            throw new IllegalStateException("CREDENTIAL_MASTER_KEY phải là " + KEY_LENGTH_BYTES
                    + " byte (sinh bằng: openssl rand -base64 32)");
        }
        return new SecretKeySpec(bytes, "AES");
    }
}
