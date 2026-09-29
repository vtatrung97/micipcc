package com.lifesup.processx.core.dto.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.lifesup.processx.core.configuration.StringTrimDeserializer;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
public class LoginRequest {

    @NotBlank(message = "{validation.username.required}")
    @Size(max = 255, message = "{validation.username.size}")
    @JsonDeserialize(using = StringTrimDeserializer.class)
    String username;

    @NotBlank(message = "{validation.password.required}")
    @Size(max = 255, message = "{validation.password.size}")
    @ToString.Exclude
    String password;
}
