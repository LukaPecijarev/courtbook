package com.example.backend.web;

import com.example.backend.dto.BookingResponse;
import com.example.backend.dto.CreateBlockRequest;
import com.example.backend.dto.CreateVenueRequest;
import com.example.backend.dto.VenueResponse;
import com.example.backend.service.application.HostApplicationService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/host")
@RequiredArgsConstructor
public class HostController {

    private final HostApplicationService hostApplicationService;

    @PostMapping("/venues")
    @ResponseStatus(HttpStatus.CREATED)
    public VenueResponse createVenue(@Valid @RequestBody CreateVenueRequest request) {
        return hostApplicationService.createVenue(request);
    }

    @PostMapping("/venues/{id}/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse blockSlot(@PathVariable Long id, @Valid @RequestBody CreateBlockRequest request) {
        return hostApplicationService.blockSlot(id, request);
    }

    @GetMapping("/venues/{id}/bookings")
    public List<BookingResponse> listBookings(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return hostApplicationService.listBookings(id, date);
    }

    @DeleteMapping("/bookings/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBooking(@PathVariable Long id) {
        hostApplicationService.deleteBooking(id);
    }
}
