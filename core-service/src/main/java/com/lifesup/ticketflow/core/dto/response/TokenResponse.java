package com.lifesup.ticketflow.core.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TokenResponse {
    @ToString.Exclude
    String accessToken;

    @ToString.Exclude
    String refreshToken;

    String tokenType;
    /** Số giây access token còn hiệu lực. */
    Long expiresIn;
    /** Số giây refresh token còn hiệu lực. */
    Long refreshExpiresIn;
    String scope;
}
