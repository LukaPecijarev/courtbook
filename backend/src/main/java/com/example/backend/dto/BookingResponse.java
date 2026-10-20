package com.example.backend.dto;

import com.example.backend.model.Booking;
import com.example.backend.model.BookingType;
import com.example.backend.model.Sport;
import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        BookingType type,
        Long venueId,
        String venueName,
        Long sportId,
        String sportName,
        LocalDateTime startAt,
        int durationMinutes,
        String customerName,
        String customerEmail) {

    public static BookingResponse from(Booking booking) {
        Sport sport = booking.getSport();
        return new BookingResponse(booking.getId(), booking.getType(),
                booking.getVenue().getId(), booking.getVenue().getName(),
                sport == null ? null : sport.getId(), sport == null ? null : sport.getName(),
                booking.getStartAt(), booking.getDurationMinutes(),
                booking.getCustomerName(), booking.getCustomerEmail());
    }
}
