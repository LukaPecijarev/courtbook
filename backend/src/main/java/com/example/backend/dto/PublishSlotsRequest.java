package com.example.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record PublishSlotsRequest(
        @NotEmpty List<@NotNull LocalDate> dates,
        @NotEmpty List<@NotNull LocalTime> startTimes) {
}
