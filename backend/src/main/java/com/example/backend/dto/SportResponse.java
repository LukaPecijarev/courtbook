package com.example.backend.dto;

import com.example.backend.model.Sport;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SportResponse(
        @NotNull Long id,
        @NotBlank String name,
        @NotBlank String color,
        String imageUrl) {

    public static SportResponse from(Sport sport) {
        return new SportResponse(sport.getId(), sport.getName(), sport.getColor(), sport.getImageUrl());
    }
}
