package com.example.backend.dto;

import com.example.backend.model.Sport;

public record SportResponse(
        Long id,
        String name,
        String color) {

    public static SportResponse from(Sport sport) {
        return new SportResponse(sport.getId(), sport.getName(), sport.getColor());
    }
}
