package com.example.backend.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record UpdateVenueRequest(
        @NotBlank @Size(max = 80) String name,
        @NotBlank @Size(max = 400) String description,
        @NotNull @Positive @Digits(integer = 8, fraction = 0) BigDecimal pricePerHour,
        @Size(max = 500) String imageUrl) {
}
