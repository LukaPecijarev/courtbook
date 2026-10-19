package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ErrorResponse(@NotBlank String message) {
}
