package com.example.backend.service.application;

import com.example.backend.dto.BookingResponse;
import com.example.backend.dto.CreateBookingRequest;

public interface BookingApplicationService {

    BookingResponse createBooking(Long venueId, CreateBookingRequest request);
}
