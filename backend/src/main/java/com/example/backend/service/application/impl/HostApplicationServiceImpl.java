package com.example.backend.service.application.impl;

import com.example.backend.dto.BookingResponse;
import com.example.backend.dto.CreateBlockRequest;
import com.example.backend.dto.CreateVenueRequest;
import com.example.backend.dto.VenueResponse;
import com.example.backend.exception.NotFoundException;
import com.example.backend.model.Booking;
import com.example.backend.model.Sport;
import com.example.backend.model.Venue;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.SportRepository;
import com.example.backend.repository.VenueRepository;
import com.example.backend.service.application.HostApplicationService;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HostApplicationServiceImpl implements HostApplicationService {

    private final VenueRepository venueRepository;
    private final SportRepository sportRepository;
    private final BookingRepository bookingRepository;
    private final BookingWriter bookingWriter;
    private final EntityLookup entityLookup;

    @Override
    @Transactional
    public VenueResponse createVenue(CreateVenueRequest request) {
        Venue venue = new Venue(request.name(), request.city(), request.address(), request.description(),
                request.pricePerHour(), LocalTime.of(request.openingHour(), 0), LocalTime.of(request.closingHour(), 0),
                findSports(request.sportIds()), null, null, List.of());
        return VenueResponse.from(venueRepository.save(venue));
    }

    @Override
    @Transactional
    public BookingResponse blockSlot(Long venueId, CreateBlockRequest request) {
        Venue venue = entityLookup.venue(venueId);
        Booking booking = bookingWriter.save(venueId, request.startAt(),
                () -> Booking.blocked(venue, request.startAt()));
        return BookingResponse.from(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> listBookings(Long venueId, LocalDate date) {
        entityLookup.venue(venueId);
        return bookingRepository.findAllForVenueOn(venueId, date).stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void deleteBooking(Long bookingId) {
        bookingRepository.delete(entityLookup.booking(bookingId));
    }

    private Set<Sport> findSports(List<Long> sportIds) {
        Set<Sport> sports = new HashSet<>(sportRepository.findAllById(sportIds));
        Set<Long> missingIds = new HashSet<>(sportIds);
        sports.forEach(sport -> missingIds.remove(sport.getId()));
        if (!missingIds.isEmpty()) {
            throw new NotFoundException("Sport not found: " + missingIds);
        }
        return sports;
    }
}
