package com.example.backend.service.application.impl;

import com.example.backend.exception.SlotAlreadyPublishedException;
import com.example.backend.model.Venue;
import com.example.backend.model.VenueSlot;
import com.example.backend.repository.VenueSlotRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
class SlotPublisher {

    private final VenueSlotRepository venueSlotRepository;

    List<VenueSlot> publish(Venue venue, Collection<LocalDate> dates, Collection<LocalTime> startTimes) {
        LocalDateTime now = LocalDateTime.now();
        List<VenueSlot> slots = dates.stream().distinct().sorted()
                .flatMap(date -> startTimes.stream().distinct().sorted().map(date::atTime))
                .map(startAt -> newSlot(venue, startAt, now))
                .toList();
        slots.forEach(slot -> requireNotPublished(venue, slot.getStartAt()));
        try {
            return venueSlotRepository.saveAllAndFlush(slots);
        } catch (DataIntegrityViolationException e) {
            throw new SlotAlreadyPublishedException(slots.get(0).getStartAt());
        }
    }

    private static VenueSlot newSlot(Venue venue, LocalDateTime startAt, LocalDateTime now) {
        if (!startAt.isAfter(now)) {
            throw new IllegalArgumentException("Slot must be in the future: " + startAt);
        }
        return VenueSlot.publish(venue, startAt);
    }

    private void requireNotPublished(Venue venue, LocalDateTime startAt) {
        if (venue.getId() != null && venueSlotRepository.existsByVenueIdAndStartAt(venue.getId(), startAt)) {
            throw new SlotAlreadyPublishedException(startAt);
        }
    }
}
