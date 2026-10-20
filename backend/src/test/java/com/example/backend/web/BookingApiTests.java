package com.example.backend.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.model.Sport;
import com.example.backend.model.Venue;
import com.example.backend.repository.SportRepository;
import com.example.backend.repository.VenueRepository;
import com.example.backend.web.interceptor.HostTokenInterceptor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class BookingApiTests {

    private static final String HOST_TOKEN = "test-host-token";
    private static final LocalDate DATE = LocalDate.now().plusDays(7);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private SportRepository sportRepository;

    private Long venueId;
    private Long tennisId;

    @BeforeEach
    void findSeededVenue() {
        Sport tennis = sportRepository.findAllByOrderByNameAsc().stream()
                .filter(sport -> sport.getName().equals("Tennis"))
                .findFirst()
                .orElseThrow();
        Venue venue = venueRepository.findAllOfferingSport(tennis.getId()).get(0);
        tennisId = tennis.getId();
        venueId = venue.getId();
    }

    @Test
    void bookingATakenSlotReturns409() throws Exception {
        LocalDateTime startAt = DATE.atTime(10, 0);
        book(startAt).andExpect(status().isCreated());

        book(startAt)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void bookingOutsideOpeningHoursReturns400() throws Exception {
        book(DATE.atTime(7, 0))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void bookingNotOnTheHourReturns400() throws Exception {
        book(DATE.atTime(10, 30)).andExpect(status().isBadRequest());
    }

    @Test
    void hostEndpointWithoutTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/host/venues/{id}/bookings", venueId).param("date", DATE.toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void hostEndpointWithWrongTokenReturns401() throws Exception {
        mockMvc.perform(get("/api/host/venues/{id}/bookings", venueId)
                        .param("date", DATE.toString())
                        .header(HostTokenInterceptor.HEADER, "wrong-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void customerCannotBookABlockedSlot() throws Exception {
        LocalDateTime startAt = DATE.atTime(18, 0);
        mockMvc.perform(post("/api/host/venues/{id}/blocks", venueId)
                        .header(HostTokenInterceptor.HEADER, HOST_TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"startAt": "%s"}""".formatted(startAt)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.type").value("BLOCKED"));

        book(startAt).andExpect(status().isConflict());
    }

    @Test
    void availabilityMarksBookedSlotUnavailable() throws Exception {
        book(DATE.atTime(9, 0)).andExpect(status().isCreated());

        mockMvc.perform(get("/api/venues/{id}/availability", venueId)
                        .param("date", DATE.toString())
                        .param("sportId", tennisId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(15))
                .andExpect(jsonPath("$[0].available").value(true))
                .andExpect(jsonPath("$[1].available").value(false));
    }

    @Test
    void venueByIdReturnsVenue() throws Exception {
        mockMvc.perform(get("/api/venues/{id}", venueId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(venueId))
                .andExpect(jsonPath("$.sports").isArray());
    }

    @Test
    void unknownVenueReturns404() throws Exception {
        mockMvc.perform(get("/api/venues/{id}", 999_999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Venue not found: 999999"));
    }

    private ResultActions book(LocalDateTime startAt) throws Exception {
        return mockMvc.perform(post("/api/venues/{id}/bookings", venueId)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"sportId": %d, "startAt": "%s", "customerName": "Ana Petrova",
                         "customerEmail": "ana@example.com"}""".formatted(tennisId, startAt)));
    }
}
