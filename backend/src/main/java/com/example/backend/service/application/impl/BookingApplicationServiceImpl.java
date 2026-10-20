package com.example.backend.service.application.impl;

import com.example.backend.dto.BookingResponse;
import com.example.backend.dto.CreateBookingRequest;
import com.example.backend.model.Booking;
import com.example.backend.model.Sport;
import com.example.backend.model.Venue;
import com.example.backend.repository.SportRepository;
import com.example.backend.repository.VenueRepository;
import com.example.backend.service.application.BookingApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingApplicationServiceImpl implements BookingApplicationService {

    private final VenueRepository venueRepository;
    private final SportRepository sportRepository;
    private final BookingWriter bookingWriter;

    @Override
    @Transactional
    public BookingResponse createBooking(Long venueId, CreateBookingRequest request) {
        Venue venue = venueRepository.findByIdOrThrow(venueId);
        Sport sport = sportRepository.findByIdOrThrow(request.sportId());
        Booking booking = bookingWriter.save(venueId, request.startAt(), () -> Booking.forCustomer(
                venue, sport, request.startAt(), request.customerName(), request.customerEmail()));
        return BookingResponse.from(booking);
    }
}
