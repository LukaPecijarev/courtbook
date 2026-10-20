package com.example.backend.service.application;

import com.example.backend.dto.BookingResponse;
import com.example.backend.dto.CreateBlockRequest;
import com.example.backend.dto.CreateVenueRequest;
import com.example.backend.dto.VenueResponse;
import java.time.LocalDate;
import java.util.List;

public interface HostApplicationService {

    VenueResponse createVenue(CreateVenueRequest request);

    BookingResponse blockSlot(Long venueId, CreateBlockRequest request);

    List<BookingResponse> listBookings(Long venueId, LocalDate date);

    void deleteBooking(Long bookingId);
}
