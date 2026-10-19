package com.example.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record CreateBookingRequest(
        @NotNull Long sportId,
        @NotNull @Future LocalDateTime startAt,
        @NotBlank @Size(max = 100) String customerName,
        @NotBlank @Email String customerEmail) {
}
