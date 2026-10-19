package com.example.backend.service.application;

import com.example.backend.dto.BookingResponse;
import com.example.backend.dto.CreateBlockRequest;
import com.example.backend.dto.CreateBookingRequest;
import com.example.backend.model.Booking;
import com.example.backend.model.Sport;
import com.example.backend.model.Venue;
import com.example.backend.model.exception.SlotAlreadyBookedException;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.SportRepository;
import com.example.backend.repository.VenueRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VenueRepository venueRepository;
    private final SportRepository sportRepository;

    @Transactional
    public BookingResponse createBooking(Long venueId, CreateBookingRequest request) {
        Venue venue = venueRepository.findByIdOrThrow(venueId);
        Sport sport = sportRepository.findByIdOrThrow(request.sportId());
        requireSlotFree(venueId, request.startAt());
        Booking booking = Booking.forCustomer(venue, sport, request.startAt(),
                request.customerName(), request.customerEmail());
        return BookingResponse.from(save(booking));
    }

    @Transactional
    public BookingResponse blockSlot(Long venueId, CreateBlockRequest request) {
        Venue venue = venueRepository.findByIdOrThrow(venueId);
        requireSlotFree(venueId, request.startAt());
        return BookingResponse.from(save(Booking.blocked(venue, request.startAt())));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> listBookings(Long venueId, LocalDate date) {
        venueRepository.findByIdOrThrow(venueId);
        return bookingRepository.findAllForVenue(venueId, date.atStartOfDay(), date.plusDays(1).atStartOfDay())
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional
    public void deleteBooking(Long bookingId) {
        bookingRepository.delete(bookingRepository.findByIdOrThrow(bookingId));
    }

    private void requireSlotFree(Long venueId, LocalDateTime startAt) {
        if (bookingRepository.existsByVenueIdAndStartAt(venueId, startAt)) {
            throw new SlotAlreadyBookedException(startAt);
        }
    }

    // The unique constraint on (venue_id, start_at) catches a concurrent booking that passed the existence check.
    private Booking save(Booking booking) {
        try {
            return bookingRepository.saveAndFlush(booking);
        } catch (DataIntegrityViolationException e) {
            throw new SlotAlreadyBookedException(booking.getStartAt());
        }
    }
}
