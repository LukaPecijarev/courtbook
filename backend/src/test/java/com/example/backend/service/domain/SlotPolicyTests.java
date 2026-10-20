package com.example.backend.service.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.Test;

class SlotPolicyTests {

    private static final LocalDate DATE = LocalDate.of(2026, 10, 25);
    private static final LocalTime OPENING = LocalTime.of(8, 0);
    private static final LocalTime CLOSING = LocalTime.of(23, 0);

    @Test
    void slotMustStartOnTheHour() {
        assertThat(SlotPolicy.startsOnTheHour(DATE.atTime(10, 0))).isTrue();
        assertThat(SlotPolicy.startsOnTheHour(DATE.atTime(10, 30))).isFalse();
    }

    @Test
    void slotMustFitWithinOpeningHours() {
        assertThat(SlotPolicy.isWithinOpeningHours(DATE.atTime(8, 0), OPENING, CLOSING)).isTrue();
        assertThat(SlotPolicy.isWithinOpeningHours(DATE.atTime(22, 0), OPENING, CLOSING)).isTrue();
        assertThat(SlotPolicy.isWithinOpeningHours(DATE.atTime(7, 0), OPENING, CLOSING)).isFalse();
        assertThat(SlotPolicy.isWithinOpeningHours(DATE.atTime(23, 0), OPENING, CLOSING)).isFalse();
    }

    @Test
    void invalidSlotIsRejected() {
        assertThatThrownBy(() -> SlotPolicy.requireValidSlot(DATE.atTime(10, 15), OPENING, CLOSING))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageStartingWith("Slot must start on the hour");
        assertThatThrownBy(() -> SlotPolicy.requireValidSlot(DATE.atTime(6, 0), OPENING, CLOSING))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageStartingWith("Slot is outside opening hours");
    }
}
