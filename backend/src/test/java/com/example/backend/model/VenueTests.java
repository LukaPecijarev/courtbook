package com.example.backend.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import org.junit.jupiter.api.Test;

class VenueTests {

    private static final LocalDate DATE = LocalDate.of(2026, 10, 25);

    @Test
    void slotsCoverOpeningHoursInHourSteps() {
        Venue venue = venue(LocalTime.of(8, 0), LocalTime.of(23, 0));

        assertThat(venue.slotStartsOn(DATE))
                .hasSize(15)
                .startsWith(DATE.atTime(8, 0))
                .endsWith(DATE.atTime(22, 0));
    }

    @Test
    void closingBeforeOpeningIsRejected() {
        assertThatThrownBy(() -> venue(LocalTime.of(20, 0), LocalTime.of(8, 0)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private static Venue venue(LocalTime openingTime, LocalTime closingTime) {
        return new Venue("Test Courts", "Skopje", "Test Street 1", null, new BigDecimal("1000"),
                openingTime, closingTime, Set.of());
    }
}
