package com.example.backend.dto;

import com.example.backend.model.Sport;
import com.example.backend.model.VenueSlot;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record FreeSlotResponse(
        Long venueId,
        String venueName,
        LocalDateTime startAt,
        BigDecimal pricePerHour,
        List<String> sports) {

    public static FreeSlotResponse from(VenueSlot slot) {
        List<String> sports = slot.getVenue().getSports().stream()
                .map(Sport::getName)
                .sorted()
                .toList();
        return new FreeSlotResponse(slot.getVenue().getId(), slot.getVenue().getName(), slot.getStartAt(),
                slot.getVenue().getPricePerHour(), sports);
    }
}
