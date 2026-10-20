package com.example.backend.dto;

import java.time.LocalDateTime;

public record SlotResponse(
        LocalDateTime startAt,
        boolean available) {
}
