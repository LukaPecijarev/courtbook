package com.example.backend.service.application.impl;

import com.example.backend.dto.SlotResponse;
import com.example.backend.dto.VenueResponse;
import com.example.backend.model.Sport;
import com.example.backend.model.Venue;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.VenueRepository;
import com.example.backend.repository.VenueSlotRepository;
import com.example.backend.service.application.VenueApplicationService;
import com.example.backend.service.domain.AvailabilityCalculator;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VenueApplicationServiceImpl implements VenueApplicationService {

    private final VenueRepository venueRepository;
    private final BookingRepository bookingRepository;
    private final VenueSlotRepository venueSlotRepository;
    private final EntityLookup entityLookup;

    @Override
    @Transactional(readOnly = true)
    public List<VenueResponse> listVenues(Long sportId) {
        return findVenues(sportId).stream()
                .map(VenueResponse::from)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VenueResponse getVenue(Long venueId) {
        return VenueResponse.from(entityLookup.venue(venueId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SlotResponse> getAvailability(Long venueId, LocalDate date, Long sportId) {
        Venue venue = entityLookup.venue(venueId);
        Sport sport = entityLookup.sport(sportId);
        venue.requireOffers(sport);
        return AvailabilityCalculator.slots(venueSlotRepository.findStartTimesOn(venueId, date),
                        bookingRepository.findStartTimesOn(venueId, date)).stream()
                .map(slot -> new SlotResponse(slot.startAt(), slot.available()))
                .toList();
    }

    private List<Venue> findVenues(Long sportId) {
        if (sportId == null) {
            return venueRepository.findAllByOrderByNameAsc();
        }
        entityLookup.sport(sportId);
        return venueRepository.findAllOfferingSport(sportId);
    }
}
