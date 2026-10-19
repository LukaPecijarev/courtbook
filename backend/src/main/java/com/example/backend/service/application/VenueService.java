package com.example.backend.service.application;

import com.example.backend.dto.CreateVenueRequest;
import com.example.backend.dto.SlotResponse;
import com.example.backend.dto.VenueResponse;
import com.example.backend.model.Sport;
import com.example.backend.model.Venue;
import com.example.backend.model.exception.NotFoundException;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.SportRepository;
import com.example.backend.repository.VenueRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;
    private final SportRepository sportRepository;
    private final BookingRepository bookingRepository;

    @Transactional(readOnly = true)
    public List<VenueResponse> listVenues(Long sportId) {
        return findVenues(sportId).stream()
                .map(VenueResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getAvailability(Long venueId, LocalDate date, Long sportId) {
        Venue venue = venueRepository.findByIdOrThrow(venueId);
        Sport sport = sportRepository.findByIdOrThrow(sportId);
        venue.requireOffers(sport);
        Set<LocalDateTime> bookedStarts = findBookedStarts(venueId, date);
        return venue.slotStartsOn(date).stream()
                .map(start -> new SlotResponse(start, !bookedStarts.contains(start)))
                .toList();
    }

    @Transactional
    public VenueResponse createVenue(CreateVenueRequest request) {
        Venue venue = new Venue(request.name(), request.city(), request.address(), request.description(),
                request.pricePerHour(), LocalTime.of(request.openingHour(), 0), LocalTime.of(request.closingHour(), 0),
                findSports(request.sportIds()));
        return VenueResponse.from(venueRepository.save(venue));
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

    private List<Venue> findVenues(Long sportId) {
        if (sportId == null) {
            return venueRepository.findAllByOrderByNameAsc();
        }
        sportRepository.findByIdOrThrow(sportId);
        return venueRepository.findAllOfferingSport(sportId);
    }

    private Set<LocalDateTime> findBookedStarts(Long venueId, LocalDate date) {
        return new HashSet<>(bookingRepository.findStartTimes(
                venueId, date.atStartOfDay(), date.plusDays(1).atStartOfDay()));
    }
}
