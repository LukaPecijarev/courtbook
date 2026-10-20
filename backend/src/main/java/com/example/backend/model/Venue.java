package com.example.backend.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
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
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
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

    @Size(max = 50)
    @Column(length = 50)
    private String surface;

    @Size(max = 30)
    @Column(length = 30)
    private String badge;

    @ElementCollection
    @CollectionTable(name = "venue_amenities", joinColumns = @JoinColumn(name = "venue_id"))
    @Column(name = "amenity", nullable = false)
    private List<String> amenities = new ArrayList<>();

    public Venue(String name, String city, String address, String description, BigDecimal pricePerHour,
                 LocalTime openingTime, LocalTime closingTime, Set<Sport> sports,
                 String surface, String badge, List<String> amenities) {
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
        updateDetails(surface, badge, amenities);
    }

    public boolean updateDetails(String surface, String badge, List<String> amenities) {
        List<String> newAmenities = Objects.requireNonNullElse(amenities, List.of());
        if (Objects.equals(this.surface, surface) && Objects.equals(this.badge, badge)
                && this.amenities.equals(newAmenities)) {
            return false;
        }
        this.surface = surface;
        this.badge = badge;
        this.amenities.clear();
        this.amenities.addAll(newAmenities);
        return true;
    }

    public boolean offers(Sport sport) {
        return sports.stream().anyMatch(offered -> offered.getId().equals(sport.getId()));
    }

    public void requireOffers(Sport sport) {
        if (!offers(sport)) {
            throw new IllegalArgumentException("Venue does not offer sport: " + sport.getName());
        }
    }
}
