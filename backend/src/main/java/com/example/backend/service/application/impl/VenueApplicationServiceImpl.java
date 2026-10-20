package com.example.backend.service.application.impl;

import com.example.backend.dto.SlotResponse;
import com.example.backend.dto.VenueResponse;
import com.example.backend.model.Sport;
import com.example.backend.model.Venue;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.SportRepository;
import com.example.backend.repository.VenueRepository;
import com.example.backend.service.application.VenueApplicationService;
import com.example.backend.service.domain.AvailabilityCalculator;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VenueApplicationServiceImpl implements VenueApplicationService {

    private final VenueRepository venueRepository;
    private final SportRepository sportRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponse> listVenues(Long sportId) {
        return findVenues(sportId).stream()
                .map(VenueResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getAvailability(Long venueId, LocalDate date, Long sportId) {
        Venue venue = venueRepository.findByIdOrThrow(venueId);
        Sport sport = sportRepository.findByIdOrThrow(sportId);
        venue.requireOffers(sport);
        return AvailabilityCalculator.slots(date, venue.getOpeningTime(), venue.getClosingTime(),
                        findBookedStarts(venueId, date)).stream()
                .map(slot -> new SlotResponse(slot.startAt(), slot.available()))
                .toList();
    }

    private List<Venue> findVenues(Long sportId) {
        if (sportId == null) {
            return venueRepository.findAllByOrderByNameAsc();
        }
        sportRepository.findByIdOrThrow(sportId);
        return venueRepository.findAllOfferingSport(sportId);
    }

    private List<LocalDateTime> findBookedStarts(Long venueId, LocalDate date) {
        return bookingRepository.findStartTimes(venueId, date.atStartOfDay(), date.plusDays(1).atStartOfDay());
    }
}
