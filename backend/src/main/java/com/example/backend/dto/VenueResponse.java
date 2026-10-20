package com.example.backend.dto;

import com.example.backend.model.Venue;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

public record VenueResponse(
        Long id,
        String name,
        String city,
        String address,
        String description,
        BigDecimal pricePerHour,
        LocalTime openingTime,
        LocalTime closingTime,
        List<SportResponse> sports,
        String surface,
        String badge,
        List<String> amenities,
        String imageUrl) {

    public static VenueResponse from(Venue venue) {
        List<SportResponse> sports = venue.getSports().stream()
                .map(SportResponse::from)
                .sorted(Comparator.comparing(SportResponse::name))
                .toList();
        return new VenueResponse(venue.getId(), venue.getName(), venue.getCity(), venue.getAddress(),
                venue.getDescription(), venue.getPricePerHour(), venue.getOpeningTime(), venue.getClosingTime(),
                sports, venue.getSurface(), venue.getBadge(), List.copyOf(venue.getAmenities()), venue.getImageUrl());
    }
}
