package com.example.backend.service.application.impl;

import com.example.backend.exception.SlotAlreadyBookedException;
import com.example.backend.model.Booking;
import com.example.backend.repository.BookingRepository;
import java.time.LocalDateTime;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class BookingWriter {

    private final BookingRepository bookingRepository;

    Booking save(Long venueId, LocalDateTime startAt, Supplier<Booking> bookingFactory) {
        requireSlotFree(venueId, startAt);
        Booking booking = bookingFactory.get();
        try {
            return bookingRepository.saveAndFlush(booking);
        } catch (DataIntegrityViolationException e) {
            throw new SlotAlreadyBookedException(booking.getStartAt());
        }
    }

    private void requireSlotFree(Long venueId, LocalDateTime startAt) {
        if (bookingRepository.existsByVenueIdAndStartAt(venueId, startAt)) {
            throw new SlotAlreadyBookedException(startAt);
        }
    }
}
