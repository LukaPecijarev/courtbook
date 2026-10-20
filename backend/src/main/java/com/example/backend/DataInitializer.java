package com.example.backend;

import com.example.backend.model.Sport;
import com.example.backend.model.Venue;
import com.example.backend.repository.SportRepository;
import com.example.backend.repository.VenueRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

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
                        "Clay tennis and padel courts along the river.", "1200", tennis, padel),
                venue("Vodno Hill Sports Park", "Hillside Road 4",
                        "Open-air park at the foot of Vodno.", "1500", tennis, basketball, football),
                venue("Old Bazaar Hoops", "Bazaar Lane 27",
                        "Outdoor streetball court near the old town.", "600", basketball),
                venue("Karpos Five-a-Side Arena", "Arena Street 9",
                        "Floodlit artificial-turf pitch for five-a-side.", "2400", football),
                venue("Aerodrom Padel Club", "Runway Boulevard 33",
                        "Two covered panoramic padel courts.", "1800", padel),
                venue("Centar Multisport Hall", "Central Square 2",
                        "Indoor hall with a convertible court.", "2000", basketball, football, padel),
                venue("Kisela Voda Tennis Club", "Parkside Lane 15",
                        "Three outdoor hard courts with evening floodlights.", "1400", tennis)));
    }

    private Sport sport(String name, String color) {
        return sportRepository.findByName(name)
                .orElseGet(() -> sportRepository.save(new Sport(name, color)));
    }

    private void seedVenues(List<Venue> venues) {
        venues.stream()
                .filter(venue -> !venueRepository.existsByName(venue.getName()))
                .forEach(venueRepository::save);
    }

    private static Venue venue(String name, String address, String description, String pricePerHour,
                               Sport... sports) {
        return new Venue(name, "Skopje", address, description, new BigDecimal(pricePerHour),
                Venue.DEFAULT_OPENING_TIME, Venue.DEFAULT_CLOSING_TIME, Set.of(sports));
    }
}
