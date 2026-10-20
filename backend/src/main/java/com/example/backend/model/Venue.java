package com.example.backend.model;

import com.example.backend.service.domain.AvailabilityCalculator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "venues")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Venue {

    public static final LocalTime DEFAULT_OPENING_TIME = LocalTime.of(8, 0);
    public static final LocalTime DEFAULT_CLOSING_TIME = LocalTime.of(23, 0);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Column(nullable = false)
    private String city;

    @NotBlank
    @Column(nullable = false)
    private String address;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerHour;

    @NotNull
    @Column(nullable = false)
    private LocalTime openingTime;

    @NotNull
    @Column(nullable = false)
    private LocalTime closingTime;

    @ManyToMany
    @JoinTable(
            name = "venue_sports",
            joinColumns = @JoinColumn(name = "venue_id"),
            inverseJoinColumns = @JoinColumn(name = "sport_id"))
    private Set<Sport> sports = new HashSet<>();

    public Venue(String name, String city, String address, String description, BigDecimal pricePerHour,
                 LocalTime openingTime, LocalTime closingTime, Set<Sport> sports) {
        this.name = name;
        this.city = city;
        this.address = address;
        this.description = description;
        this.pricePerHour = pricePerHour;
        this.openingTime = Objects.requireNonNullElse(openingTime, DEFAULT_OPENING_TIME);
        this.closingTime = Objects.requireNonNullElse(closingTime, DEFAULT_CLOSING_TIME);
        if (!this.closingTime.isAfter(this.openingTime)) {
            throw new IllegalArgumentException("Closing time must be after opening time");
        }
        this.sports = new HashSet<>(sports);
    }

    public boolean offers(Sport sport) {
        return sports.stream().anyMatch(offered -> offered.getId().equals(sport.getId()));
    }

    public void requireOffers(Sport sport) {
        if (!offers(sport)) {
            throw new IllegalArgumentException("Venue does not offer sport: " + sport.getName());
        }
    }

    public List<LocalDateTime> slotStartsOn(LocalDate date) {
        return AvailabilityCalculator.slotStarts(date, openingTime, closingTime);
    }
}
