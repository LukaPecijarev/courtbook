package com.example.backend.dto;

import com.example.backend.model.Venue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

public record VenueResponse(
        @NotNull Long id,
        @NotBlank String name,
        @NotBlank String city,
        @NotBlank String address,
        String description,
        @NotNull @Positive BigDecimal pricePerHour,
        @NotNull LocalTime openingTime,
        @NotNull LocalTime closingTime,
        @NotNull List<SportResponse> sports) {

    public static VenueResponse from(Venue venue) {
        List<SportResponse> sports = venue.getSports().stream()
                .map(SportResponse::from)
                .sorted(Comparator.comparing(SportResponse::name))
                .toList();
        return new VenueResponse(venue.getId(), venue.getName(), venue.getCity(), venue.getAddress(),
                venue.getDescription(), venue.getPricePerHour(), venue.getOpeningTime(), venue.getClosingTime(),
                sports);
    }
}
