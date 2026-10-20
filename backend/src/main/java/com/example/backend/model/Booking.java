package com.example.backend.model;

import com.example.backend.service.domain.SlotPolicy;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(
        name = "bookings",
        uniqueConstraints = @UniqueConstraint(name = "uk_booking_venue_start", columnNames = {"venue_id", "start_at"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private BookingType type;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sport_id")
    private Sport sport;

    @NotNull
    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(nullable = false)
    private int durationMinutes;

    private String customerName;

    @Email
    private String customerEmail;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private Booking(BookingType type, Venue venue, Sport sport, LocalDateTime startAt,
                    String customerName, String customerEmail) {
        SlotPolicy.requireValidSlot(startAt, venue.getOpeningTime(), venue.getClosingTime());
        this.type = type;
        this.venue = venue;
        this.sport = sport;
        this.startAt = startAt;
        this.durationMinutes = SlotPolicy.SLOT_MINUTES;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
    }

    public static Booking forCustomer(Venue venue, Sport sport, LocalDateTime startAt,
                                      String customerName, String customerEmail) {
        venue.requireOffers(sport);
        return new Booking(BookingType.CUSTOMER, venue, sport, startAt, customerName, customerEmail);
    }

    public static Booking blocked(Venue venue, LocalDateTime startAt) {
        return new Booking(BookingType.BLOCKED, venue, null, startAt, null, null);
    }
}
