package com.example.backend;

import com.example.backend.model.Sport;
import com.example.backend.model.Venue;
import com.example.backend.repository.SportRepository;
import com.example.backend.repository.VenueRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String TOP_10 = "Top 10";

    private final SportRepository sportRepository;
    private final VenueRepository venueRepository;

    @Override
    @Transactional
    public void run(String... args) {
        Sport tennis = sport("Tennis", "#C0CA33");
        Sport basketball = sport("Basketball", "#F57C00");
        Sport football = sport("Football", "#2E7D32");
        Sport padel = sport("Padel", "#1E88E5");

        seedVenues(List.of(
                venue("Vardar Riverside Courts", "Riverside Promenade 12",
                        "Clay tennis and padel courts along the river.", "1200",
                        "Clay", List.of("Changing Room", "Free Parking"), tennis, padel),
                venue("Vodno Hill Sports Park", "Hillside Road 4",
                        "Open-air park at the foot of Vodno.", "1500",
                        "Open Air", List.of("Free Parking", "Drinking Water"), tennis, basketball, football),
                venue("Old Bazaar Hoops", "Bazaar Lane 27",
                        "Outdoor streetball court near the old town.", "600",
                        "Streetball", List.of("Drinking Water"), basketball),
                venue("Karpos Five-a-Side Arena", "Arena Street 9",
                        "Floodlit artificial-turf pitch for five-a-side.", "2400",
                        "Turf", List.of("Flood Lights", "Changing Room", "Free Parking"), football),
                venue("Aerodrom Padel Club", "Runway Boulevard 33",
                        "Two covered panoramic padel courts.", "1800",
                        "Covered", List.of("Changing Room", "Equipment Rental"), padel),
                venue("Centar Multisport Hall", "Central Square 2",
                        "Indoor hall with a convertible court.", "2000",
                        "Indoor", List.of("Changing Room", "Showers", "Free Parking"), basketball, football, padel),
                venue("Kisela Voda Tennis Club", "Parkside Lane 15",
                        "Three outdoor hard courts with evening floodlights.", "1400",
                        "Hard Court", List.of("Floodlights", "Changing Room"), tennis)));
    }

    private Sport sport(String name, String color) {
        return sportRepository.findByName(name)
                .orElseGet(() -> sportRepository.save(new Sport(name, color)));
    }

    private void seedVenues(List<Venue> venues) {
        venues.forEach(seed -> venueRepository.findFirstByName(seed.getName())
                .ifPresentOrElse(existing -> updateDetails(existing, seed), () -> venueRepository.save(seed)));
    }

    private static void updateDetails(Venue existing, Venue seed) {
        if (existing.updateDetails(seed.getSurface(), seed.getBadge(), seed.getAmenities())) {
            log.info("Updated details of seeded venue: {}", existing.getName());
        }
    }

    private static Venue venue(String name, String address, String description, String pricePerHour,
                               String surface, List<String> amenities, Sport... sports) {
        return new Venue(name, "Skopje", address, description, new BigDecimal(pricePerHour),
                Venue.DEFAULT_OPENING_TIME, Venue.DEFAULT_CLOSING_TIME, Set.of(sports),
                surface, TOP_10, amenities);
    }
}
