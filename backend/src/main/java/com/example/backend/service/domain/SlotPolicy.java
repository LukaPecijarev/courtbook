package com.example.backend.service.domain;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

public final class SlotPolicy {

    public static final int SLOT_MINUTES = 60;

    private SlotPolicy() {
    }

    public static boolean startsOnTheHour(LocalDateTime start) {
        return start.equals(start.truncatedTo(ChronoUnit.HOURS));
    }

    public static boolean isWithinOpeningHours(LocalDateTime start, LocalTime openingTime, LocalTime closingTime) {
        LocalDateTime end = start.plusMinutes(SLOT_MINUTES);
        return end.toLocalDate().equals(start.toLocalDate())
                && !start.toLocalTime().isBefore(openingTime)
                && !end.toLocalTime().isAfter(closingTime);
    }

    public static void requireValidSlot(LocalDateTime start, LocalTime openingTime, LocalTime closingTime) {
        if (!startsOnTheHour(start)) {
            throw new IllegalArgumentException("Slot must start on the hour: " + start);
        }
        if (!isWithinOpeningHours(start, openingTime, closingTime)) {
            throw new IllegalArgumentException("Slot is outside opening hours: " + start);
        }
    }
}
