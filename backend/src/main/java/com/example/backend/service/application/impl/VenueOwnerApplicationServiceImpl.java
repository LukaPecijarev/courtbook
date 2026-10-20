package com.example.backend.service.application.impl;

import com.example.backend.dto.AddVenueRequest;
import com.example.backend.dto.CreatedVenueResponse;
import com.example.backend.dto.ManagedSlotResponse;
import com.example.backend.dto.PublishSlotsRequest;
import com.example.backend.dto.UpdateVenueRequest;
import com.example.backend.dto.VenueResponse;
import com.example.backend.exception.SlotAlreadyBookedException;
import com.example.backend.exception.UnauthorizedException;
import com.example.backend.model.Venue;
import com.example.backend.model.VenueSlot;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.VenueRepository;
import com.example.backend.repository.VenueSlotRepository;
import com.example.backend.service.application.VenueOwnerApplicationService;
import com.example.backend.service.domain.ManagementKeys;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VenueOwnerApplicationServiceImpl implements VenueOwnerApplicationService {

    private final VenueRepository venueRepository;
    private final VenueSlotRepository venueSlotRepository;
    private final BookingRepository bookingRepository;
    private final EntityLookup entityLookup;
    private final SlotPublisher slotPublisher;

    @Override
    @Transactional
    public CreatedVenueResponse addVenue(AddVenueRequest request) {
        String managementKey = ManagementKeys.generate();
        Venue venue = venueRepository.save(Venue.addedByOwner(request.name(), request.description(),
                request.pricePerHour(), request.imageUrl(), entityLookup.sport(request.sportId()),
                ManagementKeys.hash(managementKey)));
        slotPublisher.publish(venue, request.dates(), request.startTimes());
        return new CreatedVenueResponse(VenueResponse.from(venue), managementKey);
    }

    @Override
    @Transactional(readOnly = true)
    public void verifyManagementKey(Long venueId, String managementKey) {
        managedVenue(venueId, managementKey);
    }

    @Override
    @Transactional
    public VenueResponse updateVenue(Long venueId, String managementKey, UpdateVenueRequest request) {
        Venue venue = managedVenue(venueId, managementKey);
        venue.updateListing(request.name(), request.description(), request.pricePerHour(), request.imageUrl());
        return VenueResponse.from(venue);
    }

    @Override
    @Transactional
    public void deleteVenue(Long venueId, String managementKey) {
        Venue venue = managedVenue(venueId, managementKey);
        bookingRepository.deleteAllByVenueId(venueId);
        venueSlotRepository.deleteAllByVenueId(venueId);
        venueRepository.delete(venue);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ManagedSlotResponse> listSlots(Long venueId, String managementKey) {
        managedVenue(venueId, managementKey);
        LocalDateTime from = LocalDate.now().atStartOfDay();
        Set<LocalDateTime> booked = new HashSet<>(bookingRepository.findStartTimesFrom(venueId, from));
        return venueSlotRepository.findByVenueIdAndStartAtGreaterThanEqualOrderByStartAt(venueId, from).stream()
                .map(slot -> ManagedSlotResponse.from(slot, booked.contains(slot.getStartAt())))
                .toList();
    }

    @Override
    @Transactional
    public List<ManagedSlotResponse> publishSlots(Long venueId, String managementKey, PublishSlotsRequest request) {
        Venue venue = managedVenue(venueId, managementKey);
        return slotPublisher.publish(venue, request.dates(), request.startTimes()).stream()
                .map(slot -> ManagedSlotResponse.from(slot, false))
                .toList();
    }

    @Override
    @Transactional
    public void removeSlot(Long venueId, Long slotId, String managementKey) {
        managedVenue(venueId, managementKey);
        VenueSlot slot = entityLookup.slot(venueId, slotId);
        if (bookingRepository.existsByVenueIdAndStartAt(venueId, slot.getStartAt())) {
            throw new SlotAlreadyBookedException(slot.getStartAt());
        }
        venueSlotRepository.delete(slot);
    }

    private Venue managedVenue(Long venueId, String managementKey) {
        Venue venue = entityLookup.venue(venueId);
        if (managementKey == null || managementKey.isBlank()) {
            throw new UnauthorizedException("Missing management key");
        }
        if (!ManagementKeys.matches(managementKey, venue.getManagementKeyHash())) {
            throw new UnauthorizedException("Invalid management key for this venue");
        }
        return venue;
    }
}
