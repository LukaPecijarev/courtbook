package com.example.backend.service.application.impl;

import com.example.backend.exception.NotFoundException;
import com.example.backend.model.Booking;
import com.example.backend.model.Sport;
import com.example.backend.model.Venue;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.SportRepository;
import com.example.backend.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class EntityLookup {

    private final VenueRepository venueRepository;
    private final SportRepository sportRepository;
    private final BookingRepository bookingRepository;

    Venue venue(Long id) {
        return venueRepository.findById(id).orElseThrow(() -> new NotFoundException("Venue not found: " + id));
    }

    Sport sport(Long id) {
        return sportRepository.findById(id).orElseThrow(() -> new NotFoundException("Sport not found: " + id));
    }

    Booking booking(Long id) {
        return bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found: " + id));
    }
}
