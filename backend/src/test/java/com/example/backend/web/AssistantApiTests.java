package com.example.backend.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.model.Booking;
import com.example.backend.model.Sport;
import com.example.backend.model.Venue;
import com.example.backend.model.VenueSlot;
import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.SportRepository;
import com.example.backend.repository.VenueRepository;
import com.example.backend.repository.VenueSlotRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AssistantApiTests {

    private static final LocalDate TOMORROW = LocalDate.now().plusDays(1);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private VenueSlotRepository venueSlotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private Sport squash;
    private Venue venue;

    @BeforeEach
    void createSquashVenue() {
        squash = sportRepository.save(new Sport("Squash", "#7B1FA2"));
        venue = venueRepository.save(new Venue("Squash Hall", "Skopje", null, null, new BigDecimal("600"),
                null, null, Set.of(squash), null, null, List.of()));
    }

    @Test
    void nextFreeReturnsTheEarliestFreeSlot() throws Exception {
        publish(TOMORROW, 12);
        publish(TOMORROW, 10);
        publish(TOMORROW, 9);
        bookingRepository.save(Booking.forCustomer(venue, squash, TOMORROW.atTime(9, 0), "Ana", "ana@example.com"));

        mockMvc.perform(get("/api/assistant/quick")
                        .param("type", "next-free")
                        .param("sportId", squash.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].venueId").value(venue.getId()))
                .andExpect(jsonPath("$[0].startAt").value(TOMORROW.atTime(10, 0).toString() + ":00"))
                .andExpect(jsonPath("$[0].sports[0]").value("Squash"));
    }

    @Test
    void freeOnDateListsOnlyFreeSlotsOfThatDay() throws Exception {
        publish(TOMORROW, 18);
        publish(TOMORROW, 19);
        publish(TOMORROW.plusDays(1), 18);
        bookingRepository.save(Booking.forCustomer(venue, squash, TOMORROW.atTime(19, 0), "Ana", "ana@example.com"));

        mockMvc.perform(get("/api/assistant/quick")
                        .param("type", "free-on-date")
                        .param("sportId", squash.getId().toString())
                        .param("date", TOMORROW.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].startAt").value(TOMORROW.atTime(18, 0).toString() + ":00"));
    }

    @Test
    void unknownQuickTypeReturns400() throws Exception {
        mockMvc.perform(get("/api/assistant/quick").param("type", "cheapest"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void messageWithoutApiKeyReturns503() throws Exception {
        mockMvc.perform(post("/api/assistant/message")
                        .with(request -> {
                            request.setRemoteAddr("10.0.0.1");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"message": "Кога е следниот слободен термин?"}"""))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void messageLongerThan500CharactersReturns400() throws Exception {
        mockMvc.perform(post("/api/assistant/message")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"message": "%s"}""".formatted("a".repeat(501))))
                .andExpect(status().isBadRequest());
    }

    private void publish(LocalDate date, int hour) {
        venueSlotRepository.save(VenueSlot.publish(venue, date.atTime(hour, 0)));
    }
}
