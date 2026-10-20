package com.example.backend;

import static org.assertj.core.api.Assertions.assertThat;

import com.example.backend.model.Booking;
import com.example.backend.model.Venue;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.VenueRepository;
import com.example.backend.repository.VenueSlotRepository;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private VenueSlotRepository venueSlotRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void seededVenuesGetFourteenDaysOfHourlySlotsAndRerunsOnlyFillGaps() {
        Venue venue = venueRepository.findFirstByName(VENUE_NAME).orElseThrow();
        LocalDate today = LocalDate.now();
        LocalDateTime from = today.atStartOfDay();
        LocalDateTime to = today.plusDays(14).atStartOfDay();
        List<LocalDateTime> seeded = venueSlotRepository.findStartTimes(venue.getId(), from, to);
        assertThat(seeded)
                .hasSize(14 * 15)
                .contains(today.atTime(8, 0), today.plusDays(13).atTime(22, 0))
                .doesNotContain(today.plusDays(14).atTime(8, 0), today.atTime(23, 0));

        LocalDateTime removed = today.plusDays(2).atTime(15, 0);
        venueSlotRepository.delete(venueSlotRepository.findByVenueIdAndStartAtGreaterThanEqualOrderByStartAt(
                venue.getId(), removed).get(0));
        entityManager.flush();
        long slotsBefore = venueSlotRepository.count();

        dataInitializer.run();
        dataInitializer.run();
        entityManager.flush();

        assertThat(venueSlotRepository.count()).isEqualTo(slotsBefore + 1);
        assertThat(venueSlotRepository.findStartTimes(venue.getId(), from, to)).containsExactlyElementsOf(seeded);
    }

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
