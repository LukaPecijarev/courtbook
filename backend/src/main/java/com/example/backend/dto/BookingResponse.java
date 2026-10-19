package com.example.backend.dto;

import com.example.backend.model.Booking;
import com.example.backend.model.BookingType;
import com.example.backend.model.Sport;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

// Sport and customer fields are null for host-blocked slots.
public record BookingResponse(
        @NotNull Long id,
        @NotNull BookingType type,
        @NotNull Long venueId,
        @NotBlank String venueName,
        Long sportId,
        String sportName,
        @NotNull LocalDateTime startAt,
        @Positive int durationMinutes,
        String customerName,
        @Email String customerEmail) {

    public static BookingResponse from(Booking booking) {
        Sport sport = booking.getSport();
        return new BookingResponse(booking.getId(), booking.getType(),
                booking.getVenue().getId(), booking.getVenue().getName(),
                sport == null ? null : sport.getId(), sport == null ? null : sport.getName(),
                booking.getStartAt(), booking.getDurationMinutes(),
                booking.getCustomerName(), booking.getCustomerEmail());
    }
}
