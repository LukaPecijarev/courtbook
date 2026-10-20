package com.example.backend.model;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class VenueTests {

    @Test
    void closingBeforeOpeningIsRejected() {
        assertThatThrownBy(() -> venue(LocalTime.of(20, 0), LocalTime.of(8, 0)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private static Venue venue(LocalTime openingTime, LocalTime closingTime) {
        return new Venue("Test Courts", "Skopje", "Test Street 1", null, new BigDecimal("1000"),
                openingTime, closingTime, Set.of(), null, null, List.of());
    }
}
