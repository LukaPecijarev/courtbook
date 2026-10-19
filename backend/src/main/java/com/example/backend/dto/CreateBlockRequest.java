package com.example.backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record CreateBlockRequest(@NotNull @Future LocalDateTime startAt) {
}
