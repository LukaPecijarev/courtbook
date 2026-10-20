package com.example.backend.web;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.backend.repository.BookingRepository;
import com.example.backend.repository.SportRepository;
import com.example.backend.repository.VenueRepository;
import com.example.backend.repository.VenueSlotRepository;
import com.example.backend.service.domain.ManagementKeys;
import com.jayway.jsonpath.JsonPath;
import java.time.LocalDate;
import java.util.Map;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class VenueOwnerApiTests {

    private static final String KEY_HEADER = VenueOwnerController.MANAGEMENT_KEY_HEADER;
    private static final LocalDate DATE = LocalDate.now().plusDays(3);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SportRepository sportRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private VenueSlotRepository venueSlotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private Long padelId;

    @BeforeEach
    void findSport() {
        padelId = sportRepository.findByName("Padel").orElseThrow().getId();
    }

    @Test
    void createWithHttpsImageReturns201() throws Exception {
        addVenue("Test Padel Court", "https://example.com/court.jpg")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.venue.imageUrl").value("https://example.com/court.jpg"))
                .andExpect(jsonPath("$.venue.city").value("Skopje"))
                .andExpect(jsonPath("$.venue.address").isEmpty())
                .andExpect(jsonPath("$.managementKey").isString());
    }

    @Test
    void createWithHttpImageReturns400() throws Exception {
        addVenue("Test Padel Court", "http://example.com/court.jpg")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Image URL must start with https://"));
    }

    @Test
    void createWithoutNameReturns400() throws Exception {
        addVenue("", null).andExpect(status().isBadRequest());
    }

    @Test
    void databaseStoresOnlyTheKeyHash() throws Exception {
        CreatedVenue venue = createVenue();

        Map<String, Object> row = jdbcTemplate.queryForMap("select * from venues where id = ?", venue.id());

        assertThat(row.values()).noneMatch(value -> value != null && value.toString().contains(venue.key()));
        assertThat(row.get("management_key_hash")).isEqualTo(ManagementKeys.hash(venue.key()));
    }

    @Test
    void updateWithoutKeyReturns401AndWithKeyReturns200() throws Exception {
        CreatedVenue venue = createVenue();
        String update = """
                {"name": "Renamed Court", "description": "Now with lights.", "pricePerHour": 1500,
                 "imageUrl": null}""";

        mockMvc.perform(json(put("/api/venues/{id}", venue.id()), update))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Missing management key"));
        mockMvc.perform(json(put("/api/venues/{id}", venue.id()).header(KEY_HEADER, "wrong-key"), update))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid management key for this venue"));
        mockMvc.perform(json(put("/api/venues/{id}", venue.id()).header(KEY_HEADER, venue.key()), update))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Renamed Court"))
                .andExpect(jsonPath("$.pricePerHour").value(1500));
    }

    @Test
    void publishingSlotsChecksDuplicatesAndHours() throws Exception {
        CreatedVenue venue = createVenue();

        publishSlots(venue, "10:00").andExpect(status().isConflict());
        publishSlots(venue, "10:30").andExpect(status().isBadRequest());
        publishSlots(venue, "11:00")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$[0].startAt").value(DATE.atTime(11, 0).toString() + ":00"));
    }

    @Test
    void removingSlotsChecksBookings() throws Exception {
        CreatedVenue venue = createVenue();
        publishSlots(venue, "11:00").andExpect(status().isCreated());
        book(venue.id(), "10:00").andExpect(status().isCreated());
        Number bookedSlotId = slotId(venue, 0);
        Number freeSlotId = slotId(venue, 1);

        mockMvc.perform(delete("/api/venues/{id}/slots/{slotId}", venue.id(), bookedSlotId).header(KEY_HEADER, venue.key()))
                .andExpect(status().isConflict());
        mockMvc.perform(delete("/api/venues/{id}/slots/{slotId}", venue.id(), freeSlotId).header(KEY_HEADER, venue.key()))
                .andExpect(status().isNoContent());
    }

    @Test
    void bookingNeedsAPublishedSlot() throws Exception {
        CreatedVenue venue = createVenue();

        book(venue.id(), "12:00")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Slot is not published: " + DATE.atTime(12, 0)));
        book(venue.id(), "10:00").andExpect(status().isCreated());
    }

    @Test
    void newVenueIsListedForItsSport() throws Exception {
        CreatedVenue venue = createVenue();

        mockMvc.perform(get("/api/venues").param("sportId", padelId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", Matchers.hasItem(venue.id().intValue())));
    }

    @Test
    void verifyAcceptsTheRightKeyOnly() throws Exception {
        CreatedVenue venue = createVenue();

        mockMvc.perform(post("/api/venues/{id}/manage/verify", venue.id()).header(KEY_HEADER, venue.key()))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/venues/{id}/manage/verify", venue.id()).header(KEY_HEADER, "wrong-key"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid management key for this venue"));
    }

    @Test
    void deleteWithWrongKeyReturns401() throws Exception {
        CreatedVenue venue = createVenue();

        mockMvc.perform(delete("/api/venues/{id}", venue.id()).header(KEY_HEADER, "wrong-key"))
                .andExpect(status().isUnauthorized());
        assertThat(venueRepository.existsById(venue.id())).isTrue();
    }

    @Test
    void deleteWithKeyRemovesVenueSlotsAndBookings() throws Exception {
        CreatedVenue venue = createVenue();
        book(venue.id(), "10:00").andExpect(status().isCreated());

        mockMvc.perform(delete("/api/venues/{id}", venue.id()).header(KEY_HEADER, venue.key()))
                .andExpect(status().isNoContent());

        assertThat(venueRepository.existsById(venue.id())).isFalse();
        assertThat(venueSlotRepository.findStartTimesOn(venue.id(), DATE)).isEmpty();
        assertThat(bookingRepository.findStartTimesOn(venue.id(), DATE)).isEmpty();
        mockMvc.perform(get("/api/venues").param("sportId", padelId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].id", Matchers.not(Matchers.hasItem(venue.id().intValue()))));
    }

    private record CreatedVenue(Long id, String key) {
    }

    private CreatedVenue createVenue() throws Exception {
        String body = addVenue("Test Padel Court", null)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return new CreatedVenue(((Number) JsonPath.read(body, "$.venue.id")).longValue(),
                JsonPath.read(body, "$.managementKey"));
    }

    private ResultActions addVenue(String name, String imageUrl) throws Exception {
        String image = imageUrl == null ? "null" : "\"" + imageUrl + "\"";
        return mockMvc.perform(json(post("/api/venues"), """
                {"name": "%s", "description": "Covered court for the test.", "pricePerHour": 1200,
                 "imageUrl": %s, "sportId": %d, "dates": ["%s"], "startTimes": ["10:00"]}"""
                .formatted(name, image, padelId, DATE)));
    }

    private ResultActions publishSlots(CreatedVenue venue, String time) throws Exception {
        return mockMvc.perform(json(post("/api/venues/{id}/slots", venue.id()).header(KEY_HEADER, venue.key()), """
                {"dates": ["%s"], "startTimes": ["%s"]}""".formatted(DATE, time)));
    }

    private Number slotId(CreatedVenue venue, int index) throws Exception {
        String body = mockMvc.perform(get("/api/venues/{id}/slots", venue.id()).header(KEY_HEADER, venue.key()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(body, "$[" + index + "].id");
    }

    private ResultActions book(Long venueId, String time) throws Exception {
        return mockMvc.perform(json(post("/api/venues/{id}/bookings", venueId), """
                {"sportId": %d, "startAt": "%sT%s", "customerName": "Ana Petrova",
                 "customerEmail": "ana@example.com"}""".formatted(padelId, DATE, time)));
    }

    private static MockHttpServletRequestBuilder json(MockHttpServletRequestBuilder request, String body) {
        return request.contentType(MediaType.APPLICATION_JSON).content(body);
    }
}
