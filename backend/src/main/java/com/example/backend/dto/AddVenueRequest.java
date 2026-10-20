package com.example.backend.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record AddVenueRequest(
        @NotBlank @Size(max = 80) String name,
        @NotBlank @Size(max = 400) String description,
        @NotNull @Positive @Digits(integer = 8, fraction = 0) BigDecimal pricePerHour,
        @Size(max = 500) String imageUrl,
        @NotNull Long sportId,
        @NotEmpty List<@NotNull LocalDate> dates,
        @NotEmpty List<@NotNull LocalTime> startTimes) {
}
