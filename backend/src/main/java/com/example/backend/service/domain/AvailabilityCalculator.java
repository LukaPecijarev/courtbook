package com.example.backend.service.domain;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class AvailabilityCalculator {

    private AvailabilityCalculator() {
    }

    public static List<LocalDateTime> slotStarts(LocalDate date, LocalTime openingTime, LocalTime closingTime) {
        List<LocalDateTime> starts = new ArrayList<>();
        for (LocalDateTime start = date.atTime(openingTime);
             SlotPolicy.isWithinOpeningHours(start, openingTime, closingTime);
             start = start.plusMinutes(SlotPolicy.SLOT_MINUTES)) {
            starts.add(start);
        }
        return starts;
    }

    public static List<Slot> slots(Collection<LocalDateTime> publishedStarts, Collection<LocalDateTime> bookedStarts) {
        Set<LocalDateTime> booked = new HashSet<>(bookedStarts);
        return publishedStarts.stream()
                .sorted()
                .map(start -> new Slot(start, !booked.contains(start)))
                .toList();
    }
}
