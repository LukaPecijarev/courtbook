package com.example.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.backend.model.Booking;
import com.example.backend.model.Venue;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.VenueRepository;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class DataInitializerTests {

    private static final String VENUE_NAME = "Vardar Riverside Courts";

    @Autowired
    private DataInitializer dataInitializer;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void runUpdatesDetailsOfExistingVenueAndKeepsTheRest() {
        Venue venue = venueRepository.findFirstByName(VENUE_NAME).orElseThrow();
        venue.updateDetails("Grass", null, List.of("Sauna"));
        Booking booking = bookingRepository.save(Booking.blocked(venue, LocalDate.now().plusDays(3).atTime(10, 0)));
        Venue before = reload(venue.getId());
        long venueCount = venueRepository.count();

        dataInitializer.run();

        Venue after = reload(venue.getId());
        assertThat(after.getSurface()).isEqualTo("Clay");
        assertThat(after.getBadge()).isEqualTo("Top 10");
        assertThat(after.getAmenities()).containsExactly("Changing Room", "Free Parking");
        assertThat(after.getAddress()).isEqualTo(before.getAddress());
        assertThat(after.getPricePerHour()).isEqualByComparingTo(before.getPricePerHour());
        assertThat(after.getOpeningTime()).isEqualTo(before.getOpeningTime());
        assertThat(after.getClosingTime()).isEqualTo(before.getClosingTime());
        assertThat(after.getSports()).hasSameSizeAs(before.getSports());
        assertThat(venueRepository.count()).isEqualTo(venueCount);
        assertThat(bookingRepository.existsById(booking.getId())).isTrue();
    }

    private Venue reload(Long venueId) {
        entityManager.flush();
        entityManager.clear();
        Venue venue = venueRepository.findById(venueId).orElseThrow();
        venue.getSports().size();
        venue.getAmenities().size();
        return venue;
    }
}
