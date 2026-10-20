package com.example.backend.service.application;

import com.example.backend.dto.SlotResponse;
import com.example.backend.dto.VenueResponse;
import java.time.LocalDate;
import java.util.List;

public interface VenueApplicationService {

    List<VenueResponse> listVenues(Long sportId);

    List<SlotResponse> getAvailability(Long venueId, LocalDate date, Long sportId);
}
