package com.example.backend.service.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.Test;

class AvailabilityCalculatorTests {

    private static final LocalDate DATE = LocalDate.of(2026, 10, 25);
    private static final LocalTime OPENING = LocalTime.of(8, 0);
    private static final LocalTime CLOSING = LocalTime.of(23, 0);

    @Test
    void slotsCoverOpeningHoursInHourSteps() {
        assertThat(AvailabilityCalculator.slotStarts(DATE, OPENING, CLOSING))
                .hasSize(15)
                .startsWith(DATE.atTime(8, 0))
                .endsWith(DATE.atTime(22, 0));
    }

    @Test
    void bookedSlotIsRemovedFromFreeSlots() {
        LocalDateTime booked = DATE.atTime(18, 0);
        List<LocalDateTime> published = AvailabilityCalculator.slotStarts(DATE, OPENING, CLOSING);

        List<LocalDateTime> freeStarts = AvailabilityCalculator.slots(published, List.of(booked))
                .stream()
                .filter(Slot::available)
                .map(Slot::startAt)
                .toList();

        assertThat(freeStarts)
                .hasSize(14)
                .doesNotContain(booked)
                .contains(DATE.atTime(17, 0), DATE.atTime(19, 0));
    }
}
