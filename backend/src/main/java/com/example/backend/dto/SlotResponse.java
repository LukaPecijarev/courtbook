package com.example.backend.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record SlotResponse(
        @NotNull LocalDateTime startAt,
        boolean available) {
}
