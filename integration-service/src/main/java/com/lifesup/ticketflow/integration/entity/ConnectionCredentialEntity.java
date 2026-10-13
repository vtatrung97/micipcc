package com.lifesup.ticketflow.integration.entity;

import io.hypersistence.utils.hibernate.id.Tsid;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

/** Bảng connection_credential: secret đã mã hoá của connection (1-1), xem CredentialCipher. */
@Getter
@Setter
@Entity
@Table(name = "connection_credential")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConnectionCredentialEntity extends BaseEntity {

    @Id
    @Tsid
    Long id;

    /** connection.id */
    @Column(name = "connection_id", nullable = false, updatable = false)
    Long connectionId;

    /** Base64(IV + ciphertext + GCM tag). */
    @Column(name = "secret_ciphertext", nullable = false, columnDefinition = "longtext")
    String secretCiphertext;

    @Column(name = "key_version", nullable = false)
    Integer keyVersion;
}
