package com.example.backend.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record CreateVenueRequest(
        @NotBlank @Size(max = 255) String name,
        @NotBlank @Size(max = 255) String city,
        @NotBlank @Size(max = 255) String address,
        @Size(max = 2000) String description,
        @NotNull @Positive @Digits(integer = 8, fraction = 2) BigDecimal pricePerHour,
        @NotNull @Min(0) @Max(23) Integer openingHour,
        @NotNull @Min(0) @Max(23) Integer closingHour,
        @NotEmpty List<@NotNull Long> sportIds) {
}
