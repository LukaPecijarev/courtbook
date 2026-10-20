package com.example.backend.model;

import com.example.backend.service.domain.SlotPolicy;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "venue_slots",
        uniqueConstraints = @UniqueConstraint(name = "uk_venue_slot_start", columnNames = {"venue_id", "start_at"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class VenueSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @NotNull
    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    private VenueSlot(Venue venue, LocalDateTime startAt) {
        this.venue = venue;
        this.startAt = startAt;
    }

    public static VenueSlot publish(Venue venue, LocalDateTime startAt) {
        SlotPolicy.requireValidSlot(startAt, venue.getOpeningTime(), venue.getClosingTime());
        return new VenueSlot(venue, startAt);
    }
}
