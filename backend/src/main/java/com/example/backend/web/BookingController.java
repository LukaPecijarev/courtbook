package com.example.backend.web;

import com.example.backend.dto.BookingResponse;
import com.example.backend.dto.CreateBookingRequest;
import com.example.backend.service.application.BookingApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/venues/{venueId}/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingApplicationService bookingApplicationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(@PathVariable Long venueId,
                                         @Valid @RequestBody CreateBookingRequest request) {
        return bookingApplicationService.createBooking(venueId, request);
    }
}
