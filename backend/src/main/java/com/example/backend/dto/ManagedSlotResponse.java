package com.example.backend.dto;

import com.example.backend.model.VenueSlot;
import java.time.LocalDateTime;

public record ManagedSlotResponse(Long id, LocalDateTime startAt, boolean booked) {

    public static ManagedSlotResponse from(VenueSlot slot, boolean booked) {
        return new ManagedSlotResponse(slot.getId(), slot.getStartAt(), booked);
    }
}
